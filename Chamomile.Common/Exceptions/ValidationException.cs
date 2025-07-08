namespace Chamomile.Common.Exceptions {
    public class ValidationException : InvalidOperationException {

        public string Field { get; set; } = "";

        public ValidationException(string message, string field) : base(message) { 
            Field= field;
        }

    }
}
