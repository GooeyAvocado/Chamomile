namespace Automatic1111.Common {
    public class Sampler {
        public string name { get; set; }
        public List<string> aliases { get; set; }
        public Dictionary<string, object> options { get; set; }
    }
}
