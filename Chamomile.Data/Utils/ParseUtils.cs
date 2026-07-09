using Chamomile.Common;
using System.Text.RegularExpressions;

namespace Chamomile.API.Utils {
    public static class ParseUtils {
        public static GeneratedImage ParametersToImage(string parameters) {
            var (width, height) = ExtractSize(parameters);
            return new() {
                Prompt = ExtractPrompt(parameters),
                NegativePrompt = ExtractNegativePrompt(parameters),
                Steps = int.Parse(ExtractValue(parameters, "Steps")),
                Sampler = ExtractValue(parameters, "Sampler"),
                ScheduleType = ExtractValue(parameters, "Schedule type"),
                CFGScale = double.Parse(ExtractValue(parameters, "CFG scale")),
                Seed = long.Parse(ExtractValue(parameters, "Seed")),
                Width = width,
                Height = height,
                Loras = ExtractLoras(parameters),
                Model = ExtractModel(parameters),
            };
        }

        private static string ExtractPrompt(string data) {
            var match = Regex.Match(data, "Negative prompt|Steps");
            return match.Success ? data.Substring(0,match.Index).Trim() : "";
        }

        static string ExtractNegativePrompt(string data) {
            // Allow the negative prompt to span multiple lines by enabling Singleline mode
            // so that '.' will match newlines. Also be case-insensitive for robustness.
            var match = Regex.Match(data, @"Negative prompt:\s*(.*?)(?=\s*Steps)", RegexOptions.Singleline | RegexOptions.IgnoreCase);
            return match.Success ? match.Groups[1].Value.Trim() : "";
        }

        static string ExtractValue(string data, string label) {
            var match = Regex.Match(data, $@"{label}:\s*([^,]+),");
            return match.Success ? match.Groups[1].Value.Trim() : "";
        }

        static (int, int) ExtractSize(string data) {
            var match = Regex.Match(data, @"Size:\s*(\d+)x(\d+)");
            return match.Success ? (int.Parse(match.Groups[1].Value), int.Parse(match.Groups[2].Value)) : (0,0);
        }

        static List<string> ExtractLoras(string data) {
            var loras = new List<string>();
            var matches = Regex.Matches(data, @"<lora:([^>]*):\d*\.*\d*>");
            foreach (Match match in matches) {
                loras.Add(match.Groups[1].Value);
            }
            return loras;
        }

        static string ExtractModel(string data) {
            var match = Regex.Match(data, @"Model:\s*([a-zA-Z0-9_-]+)");
            return match.Success ? match.Groups[1].Value.Trim() : "";
        }
    }
}
