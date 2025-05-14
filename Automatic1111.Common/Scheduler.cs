namespace Automatic1111.Common {
    public class Scheduler {
        public string name { get; set; }
        public string label { get; set; }
        public List<string> aliases { get; set; }
        //public int default_rho { get; set; }
        public bool need_inner_model { get; set; }
    }
}
