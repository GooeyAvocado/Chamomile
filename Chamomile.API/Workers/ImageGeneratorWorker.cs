using Automatic1111.API;
using Chamomile.Data.Utils;
using Chamomile.Data;
using System.Collections.Concurrent;
using Chamomile.Common;
using Microsoft.AspNetCore.SignalR;
using Chamomile.API.Hubs;
using System.Text.RegularExpressions;
using System.Collections.Immutable;
using System.Security.Cryptography;

namespace Chamomile.API.Workers {
    public partial class ImageGeneratorWorker {
        private readonly ImagesDAO dao;
        private readonly A111Api api;

        private readonly ConcurrentDictionary<long, Prompt> _queue = new();
        private long _jobCounter = 0;
        private readonly CancellationTokenSource _cts = new();
        private readonly Task _workerTask;
        private readonly IHubContext<ImageGenerateHub> _hubContext;
        private readonly Random _random = new();

        public ImmutableList<ModelSequence> Sequence { get; set; } = [];
        

        private volatile Prompt? _currentPrompt;
        public Prompt? CurrentPrompt => _currentPrompt;

        public ImageGeneratorWorker(IHubContext<ImageGenerateHub> hubContext) {
            _hubContext = hubContext;
            dao = new(new EnvironmentKey("DB_URL", () => throw new InvalidOperationException("")).ToString());
            api = new(new EnvironmentKey("SD_URL", () => throw new InvalidOperationException("")).ToString());
            _workerTask = Task.Run(ProcessQueueAsync);
        }

        /// <summary>
        /// Adds a prompt to the queue and returns its Job ID.
        /// </summary>
        public long EnqueuePrompt(Prompt prompt) {
            long jobId = Interlocked.Increment(ref _jobCounter);
            _queue[jobId] = prompt;
            _hubContext.Clients.All.SendAsync("QueueUpdated", GetAllPrompts());
            return jobId;
        }

        /// <summary>
        /// Retrieves all pending prompts in order.
        /// </summary>
        public List<Prompt> GetAllPrompts() {
            return _queue.OrderByDescending(kvp => kvp.Key).Select(a => {
                a.Value.Id = Convert.ToInt32(a.Key);
                return a.Value;
            }).ToList();
        }

        /// <summary>
        /// Cancels a specific prompt if it hasn't started processing.
        /// </summary>
        public bool CancelPrompt(long jobId) {
            if (_queue.TryRemove(jobId, out _)) {
                _hubContext.Clients.All.SendAsync("QueueUpdated", GetAllPrompts());
                return true;
            }
            return false;
        }

        /// <summary>
        /// Background worker that processes prompts in order.
        /// </summary>
        private async Task ProcessQueueAsync() {
            while (!_cts.Token.IsCancellationRequested) {
                var firstItem = _queue.OrderBy(kvp => kvp.Key).FirstOrDefault();
                if (!firstItem.Equals(default(KeyValuePair<long, Prompt>))) {
                    var (jobId, prompt) = firstItem;
                    if (_queue.TryRemove(jobId, out _)) {
                        Console.WriteLine($"[Processing] Generating image for Job {jobId}: {prompt}");


#pragma warning disable CS4014 // Because this call is not awaited, execution of the current method continues before the call is completed
                        //We don't have to wait to send this
                        _hubContext.Clients.All.SendAsync("JobStarted", jobId, prompt, GetAllPrompts());
                        _currentPrompt = prompt;
#pragma warning restore CS4014 // Because this call is not awaited, execution of the current method continues before the call is completed


                        try {
                            var model = await api.GetCurrentModel();
                            var img = await api.GenerateImage(new() {
                                batch_size = 1,
                                cfg_scale = prompt.CFGScale ?? 7.0,
                                prompt = ProcessPromptText(prompt.PositivePrompt,prompt.Variables),
                                negative_prompt = ProcessPromptText(prompt.NegativePrompt ?? "",prompt.Variables),
                                width = prompt.Width ?? 1024,
                                height = prompt.Height ?? 1024,
                                n_iter = 1,
                                sampler_name = prompt.Sampler ?? null,
                                scheduler = prompt.ScheduleType ?? null,
                                seed = prompt.Seed ?? -1,
                                steps = prompt.Steps ?? 30,
                                save_images = false,
                                send_images = true,
                            }) ?? throw new InvalidOperationException("Image failed to return");

                            Console.WriteLine($"[Completed] Image generated for Job {jobId}");

                            //We don't replace the comments here because we want to preserve all of it
                            var savedImg = await dao.CreateImage(Convert.FromBase64String(img.images[0]), prompt.PositivePrompt);

#pragma warning disable CS4014 // Because this call is not awaited, execution of the current method continues before the call is completed
                            //We don't have to wait to send this
                            _currentPrompt = null;
                            _hubContext.Clients.All.SendAsync("JobCompleted", jobId, prompt, GetAllPrompts(), savedImg);
#pragma warning restore CS4014 // Because this call is not awaited, execution of the current method continues before the call is completed

                            await ReRollModel(savedImg?.Model ?? "");

                        }
                        catch (Exception e) {

#pragma warning disable CS4014 // Because this call is not awaited, execution of the current method continues before the call is completed
                            //We don't have to wait to send this
                            Console.WriteLine(e);
                            _currentPrompt = null;
                            _hubContext.Clients.All.SendAsync("JobFailed", jobId, prompt, GetAllPrompts(),e.Message);
#pragma warning restore CS4014 // Because this call is not awaited, execution of the current method continues before the call is completed


                        }
                    }
                }
                else {
                    await Task.Delay(1000); // No jobs? Wait before checking again.
                }
            }
        }

        private async Task ReRollModel(string currentModel) {

            if (Sequence.Count < 2) return; //Don't do this if we don't have a sequence

            //Find the current model 
            var currentModelChances = Sequence.Find(a => a.ModelTitle == currentModel);
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
                await api.ChangeModel(nextModel.ModelTitle);
            }
        }

        private ModelSequence? GetNextModel(string currentModel) {
            var candidates = Sequence.Where(a => a.ModelTitle != currentModel && a.LoadWeight > 0);
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

        private static string ProcessPromptText(string prompt, Dictionary<string, string>? variables) {

            if (variables != null && variables.Count > 0) {
                const int RECURSION_LIMIT = 10;
                var recursionCount = 0;

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
            }

            return CommentsPattern().Replace(prompt, "").Trim();

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
    }
}
