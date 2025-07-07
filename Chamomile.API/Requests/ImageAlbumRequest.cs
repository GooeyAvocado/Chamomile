namespace Chamomile.API.Requests {
    public class ImageAlbumRequest {
        public string Mode { get; set; } = "ADD";
        public int AlbumId { get; set; }
    }
}
