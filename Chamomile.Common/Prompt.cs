namespace Chamomile.Common {
    public class Prompt {
        public int? Id { get; set; }
        public string? Name { get; set; }
        public string PositivePrompt { get; set; } = string.Empty;
        public string? NegativePrompt { get; set; } = string.Empty;
        public int? Steps { get; set; } = 30;
        public long? Seed { get; set; } = -1;
        public string? Sampler { get; set; } = "DPM++ 2M";
        public string? ScheduleType { get; set; } = "Karras";
        public double? CFGScale { get; set; } = 7.0;
        public int? Height { get; set; } = 1024;
        public int? Width { get; set; } = 1024;
        public int? SampleImage { get; set; }
    }
}
