namespace Automatic1111.Common {
    /// <summary>Lora model</summary>
    public class Lora {

        /// <summary>Human readable name of the LORA</summary>
        public string name { get; set; } = "";

        /// <summary>Name used on the tag for a prompt</summary>
        public string alias { get; set; } = "";

        /// <summary>Where this LORA is located</summary>
        public string path { get; set; } = "";
    }
}
