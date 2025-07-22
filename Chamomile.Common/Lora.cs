namespace Chamomile.Common {

    /// <summary>LoRA on DB</summary>
    public class Lora {

        /// <summary>Name of this LoRA</summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>Alias of this LoRA that should be unique</summary>
        public string Alias { get; set; } = string.Empty ;

        /// <summary>Description/Notes form the user</summary>
        public string Description { get; set; } = string.Empty ;

        /// <summary>Activation Tags for this LoRA</summary>
        public string SamplePrompt { get; set; } = string.Empty ;

        /// <summary>Type of this LoRA (Ilustrious, Pony, NAI, etc.)</summary>
        public string? Type { get; set; } = string.Empty ;  

        /// <summary>Indicates SD reports this LoRA is present</summary>
        public bool IsAvailable { get; set; } = true;

        /// <summary>Sample image for this LoRA</summary>
        public int? BannerImage { get; set; }
    }
}
