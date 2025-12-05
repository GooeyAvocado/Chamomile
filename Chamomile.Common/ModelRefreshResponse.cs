namespace Chamomile.Common {

    //This is really only used for LoRAs but still it should be OK. Maybe we need to use this for Checkpoints in the future
    public class ModelRefreshResponse {
        public List<Model> ErrorModels { get; set; } = [];
        public List<Model> Models { get; set; } = [];
    }
}
