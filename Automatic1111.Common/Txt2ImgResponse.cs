namespace Automatic1111.Common {

    /// <summary>Responses for a Txt2Img POST</summary>
    public class Txt2ImgResponse {

        /// <summary>Images from the generation encoded in Base64</summary>
        public List<string> images { get; set; } = [];

        /// <summary>Parameters used to generate the images</summary>
        public Parameters parameters { get; set; } = new();

        /// <summary>JSON string containing more information</summary>
        public string info { get; set; } = "{}";
    }
}
