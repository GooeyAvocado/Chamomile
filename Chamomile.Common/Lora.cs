namespace Chamomile.Common {
    public class Lora {
        public string Name { get; set; } = string.Empty;
        public string Alias { get; set; } = string.Empty ;
        public string Description { get; set; } = string.Empty ;
        public string SamplePrompt { get; set; } = string.Empty ;
        public bool IsAvailable { get; set; } = true;
        public int? BannerImage { get; set; }
    }
}
