namespace Chamomile.Common {

    /// <summary>Prompt sent to Chamomile to forward to A111, or saved as a recipe</summary>
    public class Prompt {

        /// <summary>ID of the prompt if saved on DB</summary>
        public int? Id { get; set; }

        /// <summary>Name of the prompt if saved on DB</summary>
        public string? Name { get; set; }

        /// <summary>Positive Prompt text</summary>
        public string PositivePrompt { get; set; } = string.Empty;

        /// <summary>NEgative prompt text</summary>
        public string? NegativePrompt { get; set; } = string.Empty;

        /// <summary>Steps for generation</summary>
        public int? Steps { get; set; } = 30;

        /// <summary>Seed to be used for generation (not saved on DB)</summary>
        public long? Seed { get; set; } = -1;

        /// <summary>Sampler for generation</summary>
        public string? Sampler { get; set; } = "DPM++ 2M";

        /// <summary>Schedule type for generation</summary>
        public string? ScheduleType { get; set; } = "Karras";

        /// <summary>CFG Scale for generation</summary>
        public double? CFGScale { get; set; } = 7.0;

        /// <summary>Height for image generation</summary>
        public int? Height { get; set; } = 1024;

        /// <summary>Width for image generation</summary>
        public int? Width { get; set; } = 1024;

        /// <summary>Sample image for this prompt if saved on DB</summary>
        public int? SampleImage { get; set; }

        /// <summary>Variables to be used to S/R on images</summary>
        public Dictionary<string, string>? Variables { get; set; }
    }
}
