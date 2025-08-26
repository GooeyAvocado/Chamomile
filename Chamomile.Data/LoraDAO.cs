using Chamomile.Common;
using static Chamomile.Data.Utils.SqlBuilder;
using static Chamomile.Data.Utils.Constants;

namespace Chamomile.Data {
    public class LoraDAO(string connectionString) : BaseDAO(connectionString) {



        #region READ

        public async Task<List<Lora>> GetAll() {
            return await adoTemplate.Query(
                SelectSql([
                    LORA_NAME, LORA_ALIAS, LORA_AVAIL_IN,LORA_DESC, LORA_SAMPLE_PROMPT,IMAGES_ID, LORA_TYPE_CD],
                    LORA_TABLE,
                    new([]),
                    [new OrderBy(LORA_NAME)]
                ),
                (_) => { }, (reader) => new Lora() {
                    Alias = reader.GetString(LORA_ALIAS),
                    Name = reader.GetString(LORA_NAME),
                    Description = reader.GetString(LORA_DESC),
                    IsAvailable = reader.GetBoolean(LORA_AVAIL_IN),
                    SamplePrompt = reader.GetString(LORA_SAMPLE_PROMPT),
                    BannerImage = reader.GetOptionalInt(IMAGES_ID),
                    Type = reader.GetOptionalString(LORA_TYPE_CD)
                }
            );
        
        }

        public async Task<List<KeywordUsage>> GetUsage(FilterOptions filter, int limit) {
            return await adoTemplate.Query(SelectSql(
                [
                    LORA_ALIAS, 
                    $"count(*) as {LORA_USAGE_COUNT}",
                    $"min({CRE_TS}) as {MIN_TS}" ,
                    $"max({CRE_TS}) as {MAX_TS}"
                ],
                   "(" + InnerImageSql(filter,limit) + ")") 
                + $" GROUP BY {LORA_ALIAS} ORDER BY {LORA_USAGE_COUNT} DESC", (cmd) => {
                    ImagesDAO.SetterFromFilter(cmd, filter);
                }, (reader) =>
                new KeywordUsage() {
                    Keyword = reader.GetOptionalString(LORA_ALIAS) ?? "None",
                    Count = reader.GetInt(LORA_USAGE_COUNT),
                    MinTs = reader.GetDateTime(MIN_TS),
                    MaxTs = reader.GetDateTime(MAX_TS),
                }
            );
        }

        public async Task<List<KeywordUsageDated>> GetUsageDated(FilterOptions filter, int limit, string lora) {
            return await adoTemplate.Query(SelectSql(
                [
                    //LORA_ALIAS,
                    $"date({CRE_TS}) as {KEYWORD_USAGE_DATE}",
                    $"count(*) as {LORA_USAGE_COUNT}",
                    $"min({IMAGES_ID}) as {IMAGES_ID}" ,
                ],
                   "(" + InnerImageSql(filter, limit) + ")")
                + $@" 
                    WHERE {LORA_ALIAS} = @{LORA_ALIAS}
                    GROUP BY {KEYWORD_USAGE_DATE} 
                    ORDER BY {KEYWORD_USAGE_DATE} ASC
                ", (cmd) => {
                    ImagesDAO.SetterFromFilter(cmd, filter);
                    cmd.SetString(LORA_ALIAS, lora);
                }, (reader) =>
                new KeywordUsageDated() {
                    Keyword = lora,
                    Count = reader.GetInt(LORA_USAGE_COUNT),
                    Date = reader.GetDateTime(KEYWORD_USAGE_DATE),
                    Sample = reader.GetInt(IMAGES_ID),
                }
            );
        }

        private async Task<List<string>> GetUnusedLoras() {
            return await adoTemplate.Query($@"
                select l.{LORA_ALIAS}, count(m.{LORA_ALIAS}) 
                from {LORA_TABLE} l left join {IMAGES_LORA_MAP} m
                on l.{LORA_ALIAS} = m.{LORA_ALIAS}
                where l.{LORA_AVAIL_IN} = false
                group by l.{LORA_ALIAS}
                having count(m.{LORA_ALIAS}) = 0
            ", (cmd) => { }, (reader) => reader.GetString(LORA_ALIAS));

        }

        private static string InnerImageSql(FilterOptions filter, int limit) {
            return SelectSql([$"IMV.{LORA_ALIAS}", $"img.{CRE_TS}", $"img.{IMAGES_ID}"], $"{IMAGES_TABLE} left join {IMAGES_LORA_MAP} imv on img.{IMAGES_ID} = imv.{IMAGES_ID}", 
                new WhereConditionGroup(ImagesDAO.ConditionsFromFilter(filter, 0)),
                [new OrderBy(CRE_TS, SortOrder.DESC)]) + (limit > 0 ? " LIMIT " + limit : "");
        }

        #endregion

        #region UPDATE

        public async Task Update(Lora lora) {
            await adoTemplate.Execute(
                UpdateSql(
                    [LORA_DESC, LORA_SAMPLE_PROMPT, IMAGES_ID, LORA_TYPE_CD],
                    LORA_TABLE,
                    new([new(LORA_ALIAS)])
                ), (cmd) => {
                    cmd.SetString(LORA_DESC, lora.Description);
                    cmd.SetString(LORA_SAMPLE_PROMPT, lora.SamplePrompt);
                    cmd.SetInt(IMAGES_ID, lora.BannerImage);
                    cmd.SetString(LORA_ALIAS, lora.Alias);
                    cmd.SetString(LORA_TYPE_CD, lora.Type);
                });
        }

        public async Task UpdateAll(List<Automatic1111.Common.Lora> loras) {
            var existingLoras = await GetAll();
            var existingAliases = existingLoras.Select(a=>a.Alias).ToList();
            var availableAliases = loras.Select(a => a.alias).ToList();

            var newAliases = availableAliases.Except(existingAliases).ToList();
            var unavailableAliases = existingAliases.Except(availableAliases).ToList();

            var newLoras = loras.Where(a => newAliases.Contains(a.alias)).ToList();
            
            // Mark every model available 
            await adoTemplate.Execute(UpdateSql([LORA_AVAIL_IN], new() {
                { LORA_AVAIL_IN, "TRUE"}
            }, LORA_TABLE, new([])));

            //Mark unavailable models unavailable
            if (unavailableAliases.Count > 0) {
                await adoTemplate.Execute(UpdateSql([LORA_AVAIL_IN], new() {
                    { LORA_AVAIL_IN, "FALSE"}
                }, LORA_TABLE, new([new(LORA_ALIAS, unavailableAliases)])));
            }

            //Check for unavailable models that have zero images and delete them
            var unusedLoras = await GetUnusedLoras();
            if (unusedLoras.Count > 0) {
                Console.WriteLine($"{unusedLoras.Count} lora(s) unused and deleted");
                unusedLoras.ForEach(m => Console.WriteLine($"    - {m}"));
                await adoTemplate.Execute(DeleteSql(LORA_TABLE, new([new(LORA_ALIAS, unusedLoras)])));
            }

            //Create the new models
            await adoTemplate.ExecuteBatch(InsertSql(
                [LORA_NAME, LORA_ALIAS, LORA_AVAIL_IN,LORA_DESC,LORA_SAMPLE_PROMPT],
                LORA_TABLE
            ), (cmd,m) => {
                cmd.SetString(LORA_ALIAS, m.alias);
                cmd.SetString(LORA_NAME, m.name);
                cmd.SetBoolean(LORA_AVAIL_IN, true);
                cmd.SetString(LORA_DESC, "");
                cmd.SetString(LORA_SAMPLE_PROMPT, "");
            },newLoras);

        }

        #endregion

    }
}
