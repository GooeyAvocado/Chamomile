using Chamomile.Common;

namespace Chamomile.API.Utils {
    public static class Utils {
        public static async Task<KeywordUsageDatedResult> GetUsage(
            Func<FilterOptions, int, string, Task<List<KeywordUsageDated>>> filterFunction,
            KeywordFilterOptions options
        ) {

            var keywords = options.Keyword?.Split(",");
            KeywordUsageDatedResult result = new() {
                Usage = []
            };

            if (keywords?.Length > 0) {
                foreach (var k in keywords) {
                    var usage = await filterFunction.Invoke(options, options.LastImage ?? -1, k);
                    if (usage.Count == 0) continue;

                    var min = usage[0].Date;
                    var max = usage[^1].Date;
                    var maxUsage = usage.Max(a => a.Count);
                    var maxCumulativeUsage = usage.Last().CumulativeCount;

                    result.MinTs = result.MinTs == null
                        ? min : result.MinTs > min ? min : result.MinTs;

                    result.MaxTs = result.MaxTs == null
                        ? max : result.MaxTs < max ? max : result.MaxTs;

                    result.MaxUsage = Math.Max(result.MaxUsage ?? 0, maxUsage);
                    result.MaxCumulativeUsage = Math.Max(result.MaxCumulativeUsage ?? 0, maxCumulativeUsage);

                    result.Usage.Add(k, usage);
                }
            }

            return result;


        }
    }
}
