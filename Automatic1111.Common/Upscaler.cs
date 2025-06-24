namespace Automatic1111.Common {
    public class Upscaler {
        public string name { get; set;} = "";
        public string? model_name { get; set; } = null;
        public string? model_path { get; set; } = null;
        public string? model_url { get; set; } = null;
        public double? scale { get; set; } = 4;
    }
}
