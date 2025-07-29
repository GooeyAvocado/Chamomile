namespace Chamomile.Common {

    /// <summary>Filtering options when retrieving images</summary>
    public class FilterOptions {

        /// <summary>Query to hit the prompt, base prompt, and notes</summary>
        public string? Query { get; set; } = "";

        /// <summary>Album requested</summary>
        public int? Album { get; set; } = -1;

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
    }
}
