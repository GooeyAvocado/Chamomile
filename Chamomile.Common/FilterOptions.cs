namespace Chamomile.Common {
    public class FilterOptions {
        public string? Query { get; set; } = "";
        public string? Lora { get; set; } = "";
        public string? Model { get; set; } = "";
        public bool? Favorite { get; set; } = false;
        public string? FromDate { get; set; } = "";
        public string? ToDate { get; set; } = "";
        public int? Page { get; set; } = 0;
    }
}
