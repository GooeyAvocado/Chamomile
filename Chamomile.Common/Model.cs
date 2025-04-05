namespace Chamomile.Common {

    /// <summary>
    /// 
    /// </summary>
    public class Model {
        /// <summary>Use this one to set the current model and to check which one is still in use</summary>
        public string Title { get; set; } = string.Empty;

        /// <summary>Use this one for display purposes</summary>
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Type { get; set; } = string.Empty;
        public bool IsAvailable { get; set; } = true;
        public int? BannerImage { get; set; }
    }
}
