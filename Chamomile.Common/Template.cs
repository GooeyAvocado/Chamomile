namespace Chamomile.Common {
    public class Template {

        public class TemplateParam {
            public string Name { get; set; } = "";
            public string Description { get; set; } = "";
            public string Default { get; set; } = "";
        }

        public string Name { get; set; } = "";
        public string Description { get; set; } = "";
        public List<TemplateParam> Params { get; set; } = [];

        public string TemplateString { get; set; } = "";

        public int? SampleImage { get; set; }
    }
}
