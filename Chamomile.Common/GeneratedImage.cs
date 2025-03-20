namespace Chamomile.Common {
    public class GeneratedImage {
        public int Id { get; set; }
        public string Prompt { get; set; } = string.Empty;
        public string? BasePrompt { get; set; } = string.Empty;
        public string NegativePrompt {  get; set; } = string.Empty;
        public int Steps { get; set; }
        public string Sampler { get; set; } = string.Empty;
        public string ScheduleType { get; set; } = string.Empty;
        public double CFGScale { get; set; }
        public long Seed { get; set; }
        public int Height { get; set; }
        public int Width { get; set; }
        public bool HiResAvailable { get; set; }

        public List<string> Loras { get; set; } = [];
        public string Model { get; set; } = "";
        public bool Favorite { get; set; } = false;
        public DateTime Created { get; set; } = DateTime.Now;
    }
}
