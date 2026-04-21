namespace Chamomile.Common {

    /// <summary>Statistics for a specific keyword</summary>
    public class KeywordUsage {
        public string Keyword { get; set; }
        
        public int Count { get; set; }
        public int DeletedCount { get; set; }
        public int DownloadCount { get; set; }
        public int FavoriteCount { get; set; }
        public int UpscaleCount { get; set; }

        public int TotalCount => Count + DeletedCount;

        public double SuccessRate => TotalCount > 0 ? (double)Count / TotalCount : 0.0;
        public double DownloadRate => TotalCount > 0 ? (double)DownloadCount / TotalCount : 0.0;
        public double FavoriteRate => TotalCount > 0 ? (double)FavoriteCount / TotalCount : 0.0;
        public double UpscaleRate => TotalCount > 0 ? (double)UpscaleCount / TotalCount : 0.0;


        public int Sample { get; set; }
        public DateTime MinTs { get; set; }
        public DateTime MaxTs { get; set; }
    }
}
