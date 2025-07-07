namespace Chamomile.Common {

    /// <summary>A collection of images that can automatically add images based on a search</summary>
    public class Album {

        /// <summary>ID for this Album</summary>
        public int? Id { get; set; }

        /// <summary>ID of an image to serve as the thumbnail for the Album</summary>
        public int? ThumbId { get; set; }

        /// <summary>List of first four images in an album (for a preview if the thumbnail is not set)</summary>
        public List<int>? FirstFourImages { get; set; }

        /// <summary>Name of this Album</summary>
        public string Name { get; set; } = "";

        /// <summary>Search Query that'll be used to auto-tag images</summary>
        public string SearchQuery { get; set; } = "";

        /// <summary>Count of images in this album</summary>
        public int? Count { get; set; }

        /// <summary>Newest image cre_ts</summary>
        public DateTime? Newest { get; set; }

        /// <summary>Oldest image cre_ts</summary>
        public DateTime? Oldest { get; set; }

    }
}
