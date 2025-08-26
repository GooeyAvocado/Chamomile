namespace Chamomile.Common {

    /// <summary>Generated Image from A1111 saved to DB</summary>
    public class GeneratedImage {

        /// <summary>ID of the image on DB</summary>
        public int Id { get; set; }

        /// <summary>Prompt returned from A111 after generation</summary>
        public string Prompt { get; set; } = string.Empty;

        /// <summary>
        /// Prompt sent to Chamomile to generate, 
        /// including comments to be trimmed by Chamomile, 
        /// and Wildcards to be replaced by Dynamic Prompts on A111
        /// </summary>
        public string? BasePrompt { get; set; } = string.Empty;

        /// <summary>Notes left by the user post generation</summary>
        public string? Notes {  get; set; } = string.Empty;

        /// <summary>Negative prompt returned from A111 after generation</summary>
        public string NegativePrompt {  get; set; } = string.Empty;

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

        /// <summary>Size of the image in bytes. Replaced on HiRes</summary>
        public int Size { get; set; }

        /// <summary>Indicates if a HiRes image is available on DB</summary>
        public bool HiResAvailable { get; set; }

        /// <summary>How long it took to generate the image in ms</summary>
        public int? GenerationDurationMs { get; set; }

        /// <summary>Number of times the image has been downloaded</summary>
        public int? DownloadCount { get; set; }

        /// <summary>LoRAs used in generation</summary>
        public List<string> Loras { get; set; } = [];

        /// <summary>Albums this image is present in</summary>
        public List<int> Albums { get; set; } = [];

        /// <summary>Model used in generation</summary>
        public string Model { get; set; } = "";

        /// <summary>Whether or not this image is favorited</summary>
        public bool Favorite { get; set; } = false;

        /// <summary>Whether or not this image is hidden on the timeline</summary>
        public bool Hidden { get; set; } = false;

        ///<summary>Additional Information JSON</summary>
        public Dictionary<string, object>? additionalInfo { get; set; }

        /// <summary>When this image was created</summary>
        public DateTime Created { get; set; } = DateTime.Now;
    }
}
