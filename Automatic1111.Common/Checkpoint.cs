namespace Automatic1111.Common {

    /// <summary>A Stable Diff Model</summary>
    public class Checkpoint {

        /// <summary>System name of the model</summary>
        /// <example>ponywave_03.safetensors [5583f8492a]</example>
        public string title { get; set; } = "";

        /// <summary>Human name of the model</summary>
        /// <example>ponywave_03</example>
        public string model_name { get; set; } = "";

        /// <summary>Short hash of this model</summary>
        public string hash { get; set; } = "";

        /// <summary>Long hash of this model</summary>
        public string sha256 { get; set; } = "";

        /// <summary>Filename of this model</summary>
        public string filename { get; set; } = "";
    }
}
