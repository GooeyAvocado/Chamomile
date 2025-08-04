namespace Chamomile.Common {

    /// <summary>Small trailer hitch to add information on where this prompt was copied from</summary>
    public class PromptOrderData {

        /// <summary>
        /// Source of this Prompt: "IMAGE_BASE","IMAGE","SAVED_PROMPT","PROMPTBOX"
        /// </summary>
        public string Source { get; set; } = "";

        /// <summary>Image this prompt was based on, or sample image of the saved prompt. -1 if from the promptbox </summary>
        public int Sample { get; set; } = -1;

        /// <summary>Albums to add this image to after generation. Usually will either be of length 0 or 1</summary>
        public List<int>? Albums { get; set; } = [];
    }
}
