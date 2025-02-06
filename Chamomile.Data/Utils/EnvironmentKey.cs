namespace Chamomile.Data.Utils {
    public class EnvironmentKey(string key) {

        readonly Func<string>? Generator;

        public EnvironmentKey(string key, Func<string> generator) : this(key) {
            Generator = generator;
        }

        string? Val = null;

        public override string ToString() {
            if (Val != null) { return Val; }
            Val = Environment.GetEnvironmentVariable(key);
            if (Val == null) {
                //OK uh..

                if (File.Exists(key + ".txt")) {
                    Val = File.ReadAllText(key + ".txt");
                    return Val;
                }


                Val = Generator != null ? Generator() : DefaultGenerator();

                Console.WriteLine($"{key} could not be found, so we mined one: " + Val);
                Console.WriteLine("It was written to " + key + ".txt");
                File.WriteAllText(key + ".txt", Val);
            }

            return Val;
        }

        static string DefaultGenerator() {
            return new Guid().ToString();
        }

    }
}
