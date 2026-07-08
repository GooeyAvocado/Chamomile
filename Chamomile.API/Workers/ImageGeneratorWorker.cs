using Automatic1111.API;
using Chamomile.Data.Utils;
using Chamomile.Data;
using System.Collections.Concurrent;
using Chamomile.Common;
using Microsoft.AspNetCore.SignalR;
using Chamomile.API.Hubs;
using System.Text.RegularExpressions;
using System.Collections.Immutable;
using System.Diagnostics;
using Automatic1111.Common;

namespace Chamomile.API.Workers {
    public partial class ImageGeneratorWorker {
        private readonly ImagesDAO dao;
        private readonly TemplateDAO templateDAO;
        private readonly A111Api api;

        private readonly ConcurrentDictionary<long, Prompt> _queue = new();
        private long _jobCounter = 0;
        // Counter for high-priority jobs that should be placed at the front of the queue.
        // We increment this and use the negative of the value as the job id so that
        // high priority jobs sort before normal jobs (e.g. -1, -2, -3 ...).
        private long _highPriorityJobCounter = 0;
        private readonly CancellationTokenSource _cts = new();
        private readonly Task _workerTask;
        private readonly IHubContext<ImageGenerateHub> _hubContext;
        private readonly Random _random = new();

        private int _isUserPaused = 0;
        private bool _isSdPause = false;

        public bool IsPaused => Interlocked.CompareExchange(ref _isUserPaused, 0, 0) == 1;

        public void Pause() {
            Interlocked.Exchange(ref _isUserPaused, 1);
            _ = _hubContext.Clients.All.SendAsync("GenPause"); //Let the user know
        }
        public void Resume() {
            Interlocked.Exchange(ref _isUserPaused, 0);
            if (_isSdPause) _=CheckSd();
            _ = _hubContext.Clients.All.SendAsync("GenResume"); //Let the user know
        } 

        public ImmutableList<CheckpointSequence> Sequence { get; set; } = [];

        private volatile Prompt? _currentPrompt;
        private volatile int _lastInterruptedJobId = -1;

        public Prompt? CurrentPrompt => _currentPrompt;

        public ImageGeneratorWorker(IHubContext<ImageGenerateHub> hubContext) {
            _hubContext = hubContext;
            dao = new(new EnvironmentKey("DB_URL", () => throw new InvalidOperationException("")).ToString());
            templateDAO = new(new EnvironmentKey("DB_URL", () => throw new InvalidOperationException("")).ToString());
            api = new(new EnvironmentKey("SD_URL", () => throw new InvalidOperationException("")).ToString());
            _workerTask = Task.Run(ProcessQueueAsync);
        }

        /// <summary>Enqueues many prompts</summary>
        /// <param name="prompts"></param>
        /// <returns></returns>
        public List<long> EnqueuePrompts(List<Prompt> prompts) {

            List<long> jobIds = [];
            prompts.ForEach(a => {
                var jobId = Interlocked.Increment(ref _jobCounter);
                _queue[jobId] = a;
                jobIds.Add(jobId);
            });

            _hubContext.Clients.All.SendAsync("QueueUpdated", GetAllPrompts());

            //We should only be getting new prompts if SD is available. CheckSD now.
            if (_isSdPause) _ = CheckSd();

            return jobIds;
        }

        /// <summary>
        /// Enqueues many prompts to the front of the queue (high priority)
        /// </summary>
        public List<long> EnqueuePromptsToFront(List<Prompt> prompts) {
            List<long> jobIds = [];
            prompts.ForEach(a => {
                var hp = Interlocked.Increment(ref _highPriorityJobCounter);
                long jobId = -hp;
                _queue[jobId] = a;
                jobIds.Add(jobId);
            });

            _hubContext.Clients.All.SendAsync("QueueUpdated", GetAllPrompts());

            if (_isSdPause) _ = CheckSd();

            return jobIds;
        }

        /// <summary>
        /// Retrieves all pending prompts in order.
        /// </summary>
        public List<Prompt> GetAllPrompts() {
            return [.. _queue.OrderByDescending(kvp => kvp.Key).Select(a => {
                a.Value.Id = Convert.ToInt32(a.Key);
                return a.Value;
            })];
        }

        /// <summary>
        /// Cancels a specific prompt if it hasn't started processing.
        /// </summary>
        public bool CancelPrompts(List<long> jobIds) {
            foreach (var id in jobIds) {_queue.TryRemove(id, out _);}
            _hubContext.Clients.All.SendAsync("QueueUpdated", GetAllPrompts());
            return true;
        }

        /// <summary>
        /// Moves the specified prompts to the back of the queue by removing them and re-enqueuing
        /// using the normal enqueue method. Returns the new job IDs created.
        /// </summary>
        public List<long> MovePromptsToBack(List<long> jobIds) {
            var newIds = new List<long>();

            foreach (var id in jobIds) {
                if (_queue.TryRemove(id, out var prompt)) {
                    // Directly create a new normal job id and add to the queue to avoid
                    // duplicate QueueUpdated notifications coming from EnqueuePrompt.
                    var newId = Interlocked.Increment(ref _jobCounter);
                    _queue[newId] = prompt;
                    newIds.Add(newId);
                }
            }

            // Single notification for the batch
            _hubContext.Clients.All.SendAsync("QueueUpdated", GetAllPrompts());

            // If SD was paused, check once
            if (_isSdPause) _ = CheckSd();

            return newIds;
        }

        /// <summary>
        /// Moves the specified prompts to the front of the queue by removing them and re-enqueuing
        /// using the high-priority enqueue method. Returns the new job IDs created (negative values).
        /// </summary>
        public List<long> MovePromptsToFront(List<long> jobIds) {
            var newIds = new List<long>();

            foreach (var id in jobIds) {
                if (_queue.TryRemove(id, out var prompt)) {
                    // Use the high priority counter to generate a unique negative id
                    var hp = Interlocked.Increment(ref _highPriorityJobCounter);
                    long newId = -hp;
                    _queue[newId] = prompt;
                    newIds.Add(newId);
                }
            }

            // Single notification for the batch
            _hubContext.Clients.All.SendAsync("QueueUpdated", GetAllPrompts());

            // If SD was paused, check once
            if (_isSdPause) _ = CheckSd();

            return newIds;
        }

        public void InterruptJobId(int id) {
            _lastInterruptedJobId = id;
        }

        /// <summary>
        /// Clears the queue of all prompts.
        /// </summary>
        public void ClearQueue() {
            _queue.Clear();
            _hubContext.Clients.All.SendAsync("QueueUpdated", GetAllPrompts());
        }


        /// <summary>
        /// Background worker that processes prompts in order.
        /// </summary>
        private async Task ProcessQueueAsync() {

            //var loopCount = 0;

            while (!_cts.Token.IsCancellationRequested) {
                
                //If we're paused don't even bother the queue
                var firstItem = IsPaused || _isSdPause ? default : _queue.OrderBy(kvp => kvp.Key).FirstOrDefault();

                if (!firstItem.Equals(default(KeyValuePair<long, Prompt>))) {
                    var (jobId, prompt) = firstItem;
                    if (_queue.TryRemove(jobId, out _)) {
                        Console.WriteLine($"[Processing] Generating image for Job {jobId}: {prompt}");

                        if (jobId == _lastInterruptedJobId) continue ;

#pragma warning disable CS4014 // Because this call is not awaited, execution of the current method continues before the call is completed
                        //We don't have to wait to send this
                        _hubContext.Clients.All.SendAsync("JobStarted", jobId, prompt, GetAllPrompts());
                        _currentPrompt = prompt;

                        var stopwatch = new Stopwatch();

                        try {
                            var model = await api.GetCurrentCheckpoint();

                            if (!string.IsNullOrWhiteSpace(prompt?.OrderData?.Model) && model!=prompt.OrderData.Model) {
                                
                                _ = _hubContext.Clients.All.SendAsync("ModelRerollStarted", prompt.OrderData.Model);
                                await api.ChangeCheckpoint(prompt.OrderData.Model);
                                _ = _hubContext.Clients.All.SendAsync("ModelRerollComplete", prompt.OrderData.Model);
                            }

                            var p = new Parameters() {
                                batch_size = 1,
                                cfg_scale = prompt.CFGScale ?? 7.0,
                                prompt = await ProcessPromptText(prompt.PositivePrompt, prompt.Variables),
                                negative_prompt = await ProcessPromptText(prompt.NegativePrompt ?? "", prompt.Variables),
                                width = prompt.Width ?? 1024,
                                height = prompt.Height ?? 1024,
                                n_iter = 1,
                                sampler_name = prompt.Sampler ?? null,
                                scheduler = prompt.ScheduleType ?? null,
                                seed = prompt.Seed ?? -1,
                                steps = prompt.Steps ?? 30,
                                save_images = false,
                                send_images = true,
                            };

                            stopwatch.Restart();

                            var img = await api.GenerateImage(p) ?? throw new InvalidOperationException("Image failed to return");

                            stopwatch.Stop();

                            if (jobId == _lastInterruptedJobId) {
                                _currentPrompt = null;
                                _hubContext.Clients.All.SendAsync("JobCancelled", jobId, prompt, GetAllPrompts());
                                continue;
                            }

                            Console.WriteLine($"[Completed] Image generated for Job {jobId}: {stopwatch.ElapsedMilliseconds/1000.0}s");

                            //We don't replace the comments here because we want to preserve all of it
                            var savedImg = await dao.CreateImage(
                                Convert.FromBase64String(img.images[0]), 
                                prompt, 
                                (int)stopwatch.ElapsedMilliseconds,
                                prompt.OrderData,
                                prompt.OrderData?.Source == "GRID"
                            );

                            //We don't have to wait to send this
                            _currentPrompt = null;
                            _hubContext.Clients.All.SendAsync("JobCompleted", jobId, prompt, GetAllPrompts(), savedImg);
#pragma warning restore CS4014 // Because this call is not awaited, execution of the current method continues before the call is completed

                            await ReRollModel(savedImg?.Model ?? "");
                            //loopCount = 0; //We *just* successfully generated an image. We can wait a little longer

                        }
                        catch (Exception e) {

#pragma warning disable CS4014 // Because this call is not awaited, execution of the current method continues before the call is completed
                            //We don't have to wait to send this
                            Console.WriteLine(e);
                            stopwatch.Stop();

                            //Reset the loop count because we are going to check SD availability `now`
                            //loopCount = 0;

                            //If we haven't cancelled and SD is no longer available
                            if (jobId != _lastInterruptedJobId && !await CheckSd()) {
                                //Requeue the current prompt using the high-priority counter so
                                //it will be handled before normal jobs. Use a negative job id
                                //generated from _highPriorityJobCounter (e.g. -1, -2, -3 ...).
                                var hp = Interlocked.Increment(ref _highPriorityJobCounter);
                                long requeueId = -hp;
                                _queue[requeueId] = prompt;
                                _hubContext.Clients.All.SendAsync("QueueUpdated", GetAllPrompts());
                            }

                            _currentPrompt = null;
                            _hubContext.Clients.All.SendAsync("JobFailed", jobId, prompt, GetAllPrompts(),e.Message);

#pragma warning restore CS4014 // Because this call is not awaited, execution of the current method continues before the call is completed

                        }
                    }
                }
                else {
                    //if (loopCount >= 10) {
                    //    loopCount = 0; //Reset the loop count after 5 iterations

                    //    //Check if SD is still available
                    //    await CheckSd();
                    //}
                    await Task.Delay(1000); // No jobs? Wait before checking again.
                }

                //loopCount++;
            }
        }

        private async Task<bool> CheckSd() {
            var sd = await api.Ping();

            //If we don't have SD and we didn't know about it already
            if (!sd && !_isSdPause) {
                _isSdPause = true; //Pause the SD
                Pause(); //Pause it for the user as well
                _ = _hubContext.Clients.All.SendAsync("SDAvailabilityChange"); //Let the user know
            }
            else if (sd && _isSdPause) { 
                _isSdPause = false; //Unpause SD BUT do not unpause the user. We don't want to immediately resume generation. The user may want to do something
                _ = _hubContext.Clients.All.SendAsync("SDAvailabilityChange"); //Let the user know
            }

            return sd;
        }

        private async Task ReRollModel(string currentModel) {

            if (Sequence.Count < 2) return; //Don't do this if we don't have a sequence

            //Find the current model 
            var currentModelChances = Sequence.Find(a => a.Title == currentModel);
            if (currentModelChances == null) {
                //it's likely we've been bumped out of the sequence externally and we haven't realized it yet
                Sequence = []; //reset this to an empty one
                return; //l e a v e
            }

            if (_random.Next(0, 100) < currentModelChances.ChanceStay) {
                return; //We haven't beat the roll and can return. We'll stay on this model for now.
            }

            var nextModel = GetNextModel(currentModel);
            if (nextModel != null) {
                _ = _hubContext.Clients.All.SendAsync("ModelRerollStarted", nextModel.Title);
                await api.ChangeCheckpoint(nextModel.Title);
                _ = _hubContext.Clients.All.SendAsync("ModelRerollComplete", nextModel.Title);
            }
        }

        private CheckpointSequence? GetNextModel(string currentModel) {
            var candidates = Sequence.Where(a => a.Title != currentModel && a.LoadWeight > 0);
            int totalWeight = candidates.Sum(m => m.LoadWeight);
            int roll = _random.Next(0, totalWeight); // pick a number from 0 to totalWeight-1

            int cumulative = 0;

            //Gracias al señor chat yipiti
            foreach (var model in candidates) {
                cumulative += model.LoadWeight;
                if (roll < cumulative) {
                    return model;
                }
            }
            
            //This really shouldn't happen but waos
            return null;
        }

        private async Task<string> ProcessPromptText(string initPrompt, Dictionary<string, string>? variables) {

            //remove comments first
            var prompt = CommentsPattern().Replace(initPrompt, "").Trim();

            //Then apply templates
            try {
                prompt = await ApplyTemplates(prompt);
            }
            catch (Exception e) {
                Console.WriteLine("Templates failed");
                Console.WriteLine(e);
                throw;
            }

            //Then apply variables (overrides)
            if (variables != null) {

                var overrides = variables
                    .Where(kvp => !kvp.Key.StartsWith("__") && !kvp.Key.EndsWith("__"))
                    .ToDictionary(kvp => kvp.Key, kvp => kvp.Value);

                var wildcards = variables
                    .Where(kvp => (kvp.Key.StartsWith("__") && kvp.Key.EndsWith("__")))
                    .ToDictionary(kvp => kvp.Key, kvp => kvp.Value);

                prompt = ApplyVariables(ApplyVariables(prompt,overrides), wildcards);
            }

            return prompt;

        }

        private string ApplyVariables(string initPrompt, Dictionary<string, string> variables) {
            const int RECURSION_LIMIT = 10;
            var recursionCount = 0;
            var prompt = initPrompt;
            if (variables.Count == 0) return initPrompt;

            while (variables.Any(a => prompt.Contains(a.Key) && !string.IsNullOrWhiteSpace(a.Value))) {

                //We need to do this so that its caluclated before we enter the loop
                //Maybe funky things could happen if not
                var replacementList = variables.Where(a => prompt.Contains(a.Key) && !string.IsNullOrWhiteSpace(a.Value)).ToList();

                foreach (var replacement in replacementList) {
                    prompt = prompt.Replace(replacement.Key, replacement.Value);
                }

                //Limit just in case
                recursionCount++;
                if (recursionCount > RECURSION_LIMIT) break;
            }

            return prompt;


        }

        private async Task<string> ApplyTemplates(string prompt) {

            // Evaluate all matches FIRST so we don't mess up indices
            var matches = TemplatesPattern().Matches(prompt).Cast<Match>().ToList();

            if (matches.Count == 0)
                return prompt; // return nada if there's no templates

            var result = prompt;

            foreach (var match in matches) {
                var funcName = match.Groups[1].Value;
                var argsRaw = match.Groups[2].Value;

                // Split args by "~"
                var argList = argsRaw.Split('~').ToList();

                // Run your function logic
                var expanded = await templateDAO.GetAndApply(funcName, argList);

                // Replace this instance in the string
                result = result.Replace(match.Value, expanded);
            }

            return result;
        }


        /// <summary>
        /// Stops the queue processor.
        /// </summary>
        public void Stop() {
            _cts.Cancel();
            _workerTask.Wait();
        }

        [GeneratedRegex(@"(?<=^|\s)#.*|\/\/.*|\/\*[\s\S]*?\*\/")]
        public static partial Regex CommentsPattern();
        
        [GeneratedRegex(@"\[([^:\]]+):([^\]]*)\]", RegexOptions.Compiled)]
        public static partial Regex TemplatesPattern();
    }
}
