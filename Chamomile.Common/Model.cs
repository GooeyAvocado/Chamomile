namespace Chamomile.Common {

    /// <summary>A StableDiffusion Model on DB</summary>
    public class Model {
        /// <summary>
        /// Unique title for this Model. Used to identify it on DB and on SD
        /// Use this one to set the current model and to check which one is still in use
        /// </summary>
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Name of this Model. Use this one for display purposes
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>Descriptions/Notes from User</summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>Type of this Model (Ilustrious, Pony, NAI, etc.)</summary>
        public string? Type { get; set; } = string.Empty;

        /// <summary>Indicates SD reports this model is present</summary>
        public bool IsAvailable { get; set; } = true;

        /// <summary>Sample image for this model</summary>
        public int? BannerImage { get; set; }
    }
}
