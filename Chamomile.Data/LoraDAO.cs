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

        public async Task<List<Usage>> GetUsage(FilterOptions filter, int limit) {
            return await adoTemplate.Query(SelectSql(
                [LORA_ALIAS, "count(*) as " + LORA_USAGE_COUNT],
                   "(" + InnerImageSql(filter,limit) + ")") 
                + $" GROUP BY {LORA_ALIAS} ORDER BY {LORA_USAGE_COUNT} DESC", (cmd) => {
                    ImagesDAO.SetterFromFilter(cmd, filter);
                }, (reader) =>
                new Usage() {
                    name = reader.GetOptionalString(LORA_ALIAS) ?? "None",
                    count = reader.GetInt(LORA_USAGE_COUNT)
                }
            );
        }

        private static string InnerImageSql(FilterOptions filter, int limit) {
            return SelectSql(["IMV." + LORA_ALIAS], $"{IMAGES_TABLE} i left join {IMAGES_LORA_MAP} imv on i.{IMAGES_ID} = imv.{IMAGES_ID}", 
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
