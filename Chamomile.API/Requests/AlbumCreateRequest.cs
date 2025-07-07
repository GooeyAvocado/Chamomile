using Chamomile.Common;

namespace Chamomile.API.Requests {
    public class AlbumCreateRequest : Album {
        public bool AddExisting {get; set;}
    }
}
