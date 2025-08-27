namespace Chamomile.Common {
    public class Grid {
        /// <summary>ID of the image on DB</summary>
        public int Id { get; set; }

        public string Name { get; set; }

        /// <summary>Prompt returned from A111 after generation</summary>
        public string Prompt { get; set; } = string.Empty;

        /// <summary>Notes left by the user post generation</summary>
        public string? Notes { get; set; } = string.Empty;

        /// <summary>Negative prompt returned from A111 after generation</summary>
        public string NegativePrompt { get; set; } = string.Empty;

        /// <summary>Steps used to generate</summary>
        public int Steps { get; set; }

        /// <summary>Sampler used to generate</summary>
        public string Sampler { get; set; } = string.Empty;

        /// <summary>Scheduler used to generate</summary>
        public string ScheduleType { get; set; } = string.Empty;

        /// <summary>CFG Scale used to generate</summary>
        public double CFGScale { get; set; }

        /// <summary>Seed used to generate</summary>
        public long Seed { get; set; }

        /// <summary>Height of the image. Replaced on HiRes</summary>
        public int Height { get; set; }

        /// <summary>Width of the image. Replaced on HiRes</summary>
        public int Width { get; set; }

        /// <summary>How long it took to generate the image in ms</summary>
        public int? GenerationDurationMs { get; set; }

        /// <summary>Mode to use the vals in XVals</summary>
        public string XValMode {get; set;}

        /// <summary>Values along the X axis</summary>
        public List<string> XVals { get; set; }

        /// <summary>Mode to use the vals in YVals</summary>
        public string YValMode { get; set; }

        /// <summary>Values along the y axis of this</summary>
        public List<string> YVals { get; set; }

        public List<int>? FirstFour { get; set; }

        /// <summary>When this image was created</summary>
        public DateTime Created { get; set; } = DateTime.Now;
    }
}
