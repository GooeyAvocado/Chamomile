namespace Chamomile.Common {

    /// <summary>Statistics for a specific keyword</summary>
    public class KeywordUsageDatedResult {
        public DateTime? MaxTs { get; set; }
        public DateTime? MinTs { get; set; }
        public int? MaxUsage { get; set; }
        public int? MaxCumulativeUsage { get; set; }

        //No need for a min usage, as it will always be 0

        public Dictionary<string, List<KeywordUsageDated>> Usage { get; set; }

        
    }
}
