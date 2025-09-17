namespace Chamomile.Common {

    /// <summary>Filtering options when retrieving images</summary>
    public class FilterOptions {

        /// <summary>Query to hit the prompt, base prompt, and notes</summary>
        public string? Query { get; set; } = "";

        /// <summary>Album requested</summary>
        public int? Album { get; set; } = -1;

        /// <summary>Grid requested</summary>
        public int? Grid { get; set; } = -1;

        /// <summary>Sample image to search by </summary>
        public int? Sample { get; set; } = -1;

        /// <summary>LoRA requested</summary>
        public string? Lora { get; set; } = "";

        /// <summary>Model requested</summary>
        public string? Model { get; set; } = "";

        /// <summary>Whether images should be favorited or not</summary>
        public bool? Favorite { get; set; } = false;

        /// <summary>Whether images should be upscaled or not</summary>
        public bool? Upscaled { get; set; } = false;

        /// <summary>Retrieves only previously downloaded images</summary>
        public bool? Downloaded { get; set; } = false;


        /// <summary>Start range for the results</summary>
        public string? FromDate { get; set; } = "";

        /// <summary>End date for the results</summary>
        public string? ToDate { get; set; } = "";


        /// <summary>Last image returned from last request for pagination</summary>
        public int? LastImage { get; set; } = 0;

        /// <summary>Gets everything</summary>
        public bool? DisablePagination { get; set; } = false;

        /// <summary>Checks if a filter is "Empty" as should be reported by the UI</summary>
        /// <param name="filter"></param>
        /// <returns>True if the following fields are empty:
        /// <ul>
        /// <li>From Date</li>
        /// <li>To Date</li>
        /// <li>LoRA</li>
        /// <li>Model</li>
        /// <li>Query</li>
        /// <li>Sample</li>
        /// </ul>
        /// AND if the following fields are false
        /// <ul>
        /// <li>Favorite</li>
        /// <li>Upscale</li>
        /// <li>Download</li>
        /// </ul>
        /// </returns>
        public static bool IsEmpty(FilterOptions filter) =>
            filter.Favorite == false
            && filter.Upscaled == false
            && filter.Downloaded == false
            && string.IsNullOrWhiteSpace(filter.FromDate)
            && string.IsNullOrWhiteSpace(filter.ToDate)
            && string.IsNullOrWhiteSpace(filter.Lora)
            && string.IsNullOrWhiteSpace(filter.Model)
            && string.IsNullOrWhiteSpace(filter.Query)
            && (filter.Sample ?? 0) < 1;

    }
}
