namespace Chamomile.Common {

    /// <summary>Statistics for a specific keyword</summary>
    public class KeywordUsage {
        public string Keyword { get; set; }
        public int Count { get; set; }
        public int Sample { get; set; }
        public DateTime MinTs { get; set; }
        public DateTime MaxTs { get; set; }
    }
}
