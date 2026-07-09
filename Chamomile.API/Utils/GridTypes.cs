using Chamomile.Common;
using System.Globalization;

namespace Chamomile.API.Utils {
    public static class GridTypes {
        public static Prompt ApplyGridToPrompt(
            Prompt prompt,
            string gridCode,
            string? value,
            List<string>? values = null
        ) {
            ArgumentNullException.ThrowIfNull(prompt);

            if (string.IsNullOrWhiteSpace(gridCode)) {return prompt;}

            if (string.IsNullOrWhiteSpace(value) && gridCode != "NON") {
                return prompt;
            }

            switch (gridCode) {
                case "NON":
                    return prompt;

                case "POS":
                    prompt.PositivePrompt = value!;
                    return prompt;

                case "NEG":
                    prompt.NegativePrompt = value!;
                    return prompt;

                case "PSR":
                    if (values == null || values.Count == 0)
                        return prompt;

                    var search = values[0];
                    if (string.IsNullOrEmpty(search)) { return prompt; }

                    prompt.PositivePrompt =
                        prompt.PositivePrompt.Replace(search, value!, StringComparison.Ordinal);

                    prompt.NegativePrompt =
                        prompt.NegativePrompt!.Replace(search, value!, StringComparison.Ordinal);

                    return prompt;

                case "MOD":
                    prompt.OrderData!.Model = value!;
                    return prompt;

                case "LOR":
                    prompt.PositivePrompt =
                        string.IsNullOrWhiteSpace(prompt.PositivePrompt)
                            ? value!
                            : $"{prompt.PositivePrompt} {value}";
                    return prompt;

                case "CFG":
                    if (float.TryParse(value, NumberStyles.Float, CultureInfo.InvariantCulture, out var cfg))
                        prompt.CFGScale = cfg;
                    return prompt;

                case "SEED":
                    if (int.TryParse(value, out var seed))
                        prompt.Seed = seed;
                    return prompt;

                case "DIMN":
                    var parts = value!.Split('x', StringSplitOptions.RemoveEmptyEntries);
                    if (parts.Length == 2) {
                        if (int.TryParse(parts[0], out var w))
                            prompt.Width = w;
                        if (int.TryParse(parts[1], out var h))
                            prompt.Height = h;
                    }
                    return prompt;

                case "STEP":
                    if (int.TryParse(value, out var steps))
                        prompt.Steps = steps;
                    return prompt;

                case "SMPL":
                    prompt.Sampler = value!;
                    return prompt;

                case "SCHD":
                    prompt.ScheduleType = value!;
                    return prompt;
                case "PSFX":
                    prompt.PositivePrompt = prompt.PositivePrompt + "\n\n" + value;
                    return prompt;
                case "NSFX":
                    prompt.NegativePrompt = prompt.NegativePrompt + " \n\n " + value;
                    return prompt;
                default:
                    // Unknown grid type: noop by design
                    return prompt;
            }
        }

    }
}
