namespace Chamomile.Common {

    /// <summary>
    /// New unified model class for both LoRAs and Checkpoints
    /// </summary>
    public class Model {

        /// <summary>Unique identifier of a Model. For Loras this is their Alias. For Checkpoints, this is their title</summary>
        public string ID { get; set; } = string.Empty;

        /// <summary>Name of this model</summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>Description/Notes form the user</summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>Sample prompt for this model</summary>
        public string SamplePrompt { get; set; } = string.Empty;

        /// <summary>Type of this model (Ilustrious, Pony, NAI, etc.)</summary>
        public string? Type { get; set; } = string.Empty;

        /// <summary>Indicates SD reports this model is present</summary>
        public bool IsAvailable { get; set; } = true;

        /// <summary>Sample image for this model</summary>
        public int? BannerImage { get; set; }

        /// <summary>Tags for this model</summary>
        public List<string> Tags { get; set; } = [];
    }
}
