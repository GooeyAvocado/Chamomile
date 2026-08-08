namespace Chamomile.Common {
    public class GeneralStatistics {
        public DateTime? MinTs { get; set; }
        public DateTime? MaxTs { get; set; }
        public int FavCount { get; set; }
        public int UpscaledCount { get; set; }
        public int DownloadCount { get; set; }
        public int? TotalDownloads { get; set; }
        public int TotalCount { get; set; }
        public double AvgGenTime { get; set; }
        public double MaxImageId { get; set; }

        public Dictionary<string,int> CountBySource { get; set; }

    }
}
