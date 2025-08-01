namespace Chamomile.Common {

    /// <summary>Statistics for a specific keyword</summary>
    public class KeywordUsageDated {
        public string Keyword { get; set; }
        public int Count { get; set; }
        public int Sample { get; set; }
        public DateTime Date { get; set; }
    }
}
