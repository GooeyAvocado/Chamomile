namespace Chamomile.Common {

    /// <summary>Used by the frontend to indicate the current state of the Image Worker</summary>
    public class ImageWorkerState {

        /// <summary>Images in Queue</summary>
        public List<Prompt> Queue { get; set; } = [];

        /// <summary>Current Job (If null, no job is currently active)</summary>
        public Prompt? CurrentJob { get; set; } = null;

        /// <summary>Indicates if the worker is paused (either because SD is unavailable, or because the user said so)</summary>
        public bool Paused { get; set; } = false;

    }
}
