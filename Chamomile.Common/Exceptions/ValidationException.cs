namespace Chamomile.Common.Exceptions {

    /// <summary>Validation exception from an invalid field</summary>
    public class ValidationException(string message, string field) : InvalidOperationException(message) {

        /// <summary>Field causing the exception</summary>
        public string Field { get; set; } = field;
    }
}
