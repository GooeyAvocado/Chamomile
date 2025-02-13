
namespace Automatic1111.Common {
    public class HiResRequest {
        public int ResizeFactor { get; set; } = 4;
        public string Upscaler { get; set; } = string.Empty;
        public int ImageID { get; set; } = 0;
    }
}
