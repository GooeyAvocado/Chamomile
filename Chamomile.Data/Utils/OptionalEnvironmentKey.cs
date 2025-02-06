namespace Chamomile.Data.Utils {
    public class OptionalEnvironmentKey(string key) {

        string? Val = null;

        public override string? ToString() {
            if (Val != null) { return Val; }
            
            Val = Environment.GetEnvironmentVariable(key);

            return Val == null && File.Exists(key + ".txt") 
                ? (Val = File.ReadAllText(key + ".txt")) 
                : Val;
        }

    }
}
