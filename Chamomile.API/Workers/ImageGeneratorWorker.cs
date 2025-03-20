using Automatic1111.API;
using Chamomile.Data.Utils;
using Chamomile.Data;
using System.Collections.Concurrent;
using Chamomile.Common;
using Microsoft.AspNetCore.SignalR;
using Chamomile.API.Hubs;
using System.Text.RegularExpressions;

namespace Chamomile.API.Workers {
    public partial class ImageGeneratorWorker {
        private readonly ImagesDAO dao;
        private readonly A111Api api;

        private readonly ConcurrentDictionary<long, Prompt> _queue = new();
        private long _jobCounter = 0;
        private readonly CancellationTokenSource _cts = new();
        private readonly Task _workerTask;
        private readonly IHubContext<ImageGenerateHub> _hubContext;

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
#pragma warning restore CS4014 // Because this call is not awaited, execution of the current method continues before the call is completed


                        try {
                            var model = await api.GetCurrentModel();
                            var img = await api.GenerateImage(new() {
                                batch_size = 1,
                                cfg_scale = prompt.CFGScale ?? 7.0,
                                prompt = CommentsPattern().Replace(prompt.PositivePrompt, ""),
                                negative_prompt = CommentsPattern().Replace(prompt.NegativePrompt ?? "", ""),
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
                            _hubContext.Clients.All.SendAsync("JobCompleted", jobId, prompt, GetAllPrompts(), savedImg);
#pragma warning restore CS4014 // Because this call is not awaited, execution of the current method continues before the call is completed

                        }
                        catch (Exception e) {

#pragma warning disable CS4014 // Because this call is not awaited, execution of the current method continues before the call is completed
                            //We don't have to wait to send this
                            Console.WriteLine(e);
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
