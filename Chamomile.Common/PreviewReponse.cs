namespace Chamomile.Common {
    /// <summary>Response from a prompt preview</summary>
    public class PreviewReponse {

        /// <summary>Image Metadata</summary>
        public GeneratedImage? Metadata {get; set;}

        /// <summary>Base64 encoded image data</summary>
        public string Data { get; set; } = "";
    }
}
