namespace Chamomile.API.Requests {
    public class GenerateGridRequest {
        public int Id {get; set;}
        public List<GenerateGridCoords> Coordinates { get; set; } = [];
    }

    public class GenerateGridCoords { 
        public int X { get; set; }
        public int Y { get; set; }
    }
}
