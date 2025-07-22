namespace Chamomile.Common {
    
    /// <summary>Element on a list of models for a sequence to dynamically switch on</summary>
    public class ModelSequence {

        /// <summary>Title of the model</summary>
        public string ModelTitle { get; set; } = "";

        /// <summary>Percent Chance (0-100) to stay on a model</summary>
        public int ChanceStay { get; set; } = 0;

        /// <summary>Number of sides on a dice that's rolled along with other models in the sequence to determine next model</summary>
        public int LoadWeight { get; set; } = 1;

    }
}
