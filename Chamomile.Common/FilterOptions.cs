namespace Chamomile.Common {
    public class FilterOptions {
        public string? Query { get; set; } = "";
        public int? Album { get; set; } = -1;
        public string? Lora { get; set; } = "";
        public string? Model { get; set; } = "";
        public bool? Favorite { get; set; } = false;
        public string? FromDate { get; set; } = "";
        public string? ToDate { get; set; } = "";
        public int? LastImage { get; set; } = 0;
    }
}
