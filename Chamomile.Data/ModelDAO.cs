using Chamomile.Common;
using static Chamomile.Data.Utils.SqlBuilder;
using static Chamomile.Data.Utils.Constants;

namespace Chamomile.Data {
    public class ModelDAO(string connectionString) : BaseDAO(connectionString) {

        #region READ

        public async Task<List<Model>> GetAll() {
            return await adoTemplate.Query(
                SelectSql([
                    MODEL_NAME, MODEL_TITLE, MODEL_AVAIL_IN,MODEL_DESC,IMAGES_ID,MODEL_TYPE_CD, MODEL_TAG],
                    MODELS_TABLE,
                    new([]),
                    [new OrderBy(MODEL_NAME)]
                ),
                (_) => { }, (reader) => new Model() {
                    Title = reader.GetString(MODEL_TITLE),
                    Name = reader.GetString(MODEL_NAME),
                    Type = reader.GetOptionalString(MODEL_TYPE_CD),
                    Description = reader.GetString(MODEL_DESC),
                    IsAvailable = reader.GetBoolean(MODEL_AVAIL_IN),
                    BannerImage = reader.GetOptionalInt(IMAGES_ID),
                    Tags= [.. (reader.GetValue(MODEL_TAG) as string[] ?? [])],
                }
            );
        
        }

        public async Task<List<string>> GetAllTags() {
            var tags = "TAGS";
            return await adoTemplate.Query(
                SelectSql([$"unnest({MODEL_TAG}) as {tags}"], MODELS_TABLE, true),
                (cmd) => { },
                (reader) => reader.GetString(tags)
            );
        }

        public async Task<List<KeywordUsage>> GetUsage(FilterOptions filter, int limit) {
            return await adoTemplate.Query(SelectSql(
                [
                    MODEL_TITLE, 
                    $"count(*) as {MODEL_USAGE_COUNT}", 
                    $"min({CRE_TS}) as {MIN_TS}" ,
                    $"max({CRE_TS}) as {MAX_TS}"
                ], 
                "(" + InnerImageSql(filter,limit) + ")" ) 
                + $" GROUP BY {MODEL_TITLE} ORDER BY {MODEL_USAGE_COUNT} DESC, {MODEL_TITLE}", (cmd) =>{
                    ImagesDAO.SetterFromFilter(cmd, filter);
                }, (reader) => 
                new KeywordUsage() { 
                    Keyword = reader.GetString(MODEL_TITLE),
                    Count= reader.GetInt(MODEL_USAGE_COUNT),
                    MinTs = reader.GetDateTime(MIN_TS),
                    MaxTs= reader.GetDateTime(MAX_TS),
                }
            );
        }

        public async Task<List<KeywordUsageDated>> GetUsageDated(FilterOptions filter, int limit, string model) {
            return await adoTemplate.Query(SelectSql(
                [
                    //MODEL_TITLE,
                    $"date({CRE_TS}) as {KEYWORD_USAGE_DATE}",
                    $"count(*) as {MODEL_USAGE_COUNT}",
                    $"min({IMAGES_ID}) as {IMAGES_ID}" ,
                ],
                "(" + InnerImageSql(filter, limit) + ")")
                + $@" 
                    WHERE {MODEL_TITLE} = @{MODEL_TITLE}
                    GROUP BY {KEYWORD_USAGE_DATE} 
                    ORDER BY {KEYWORD_USAGE_DATE} ASC
                ", (cmd) => {
                    ImagesDAO.SetterFromFilter(cmd, filter);
                    cmd.SetString(MODEL_TITLE, model);
                }, (reader) =>
                new KeywordUsageDated() {
                    Keyword = model,
                    Count = reader.GetInt(MODEL_USAGE_COUNT),
                    Date = reader.GetDateTime(KEYWORD_USAGE_DATE),
                    Sample = reader.GetInt(IMAGES_ID)
                }
            );
        }

        private async Task<List<string>> GetUnusedModels() {
            return await adoTemplate.Query($@"
                select m.{MODEL_TITLE}
                from {MODELS_TABLE} m left join {IMAGES_TABLE} on m.{MODEL_TITLE} = img.{MODEL_TITLE} 
                where {MODEL_AVAIL_IN}  = false
                group by  m.{MODEL_TITLE}
                HAVING COUNT(img.{MODEL_TITLE}) = 0", (cmd) => { }, (reader) => reader.GetString(MODEL_TITLE));
        }

        private static string InnerImageSql(FilterOptions filter, int limit) {
            return SelectSql([MODEL_TITLE, CRE_TS, IMAGES_ID], IMAGES_TABLE, new WhereConditionGroup(ImagesDAO.ConditionsFromFilter(filter, 0)),
                [new OrderBy(CRE_TS, SortOrder.DESC)]) + (limit > 0 ? " LIMIT " + limit : "");
        }

        #endregion

        #region UPDATE

        public async Task Update(Model model) {
            await adoTemplate.Execute(
                UpdateSql(
                    [MODEL_DESC, IMAGES_ID, MODEL_TYPE_CD, MODEL_TAG],
                    MODELS_TABLE,
                    new([new(MODEL_TITLE)])
                ), (cmd) => {
                    cmd.SetString(MODEL_DESC, model.Description);
                    cmd.SetInt(IMAGES_ID, model.BannerImage);
                    cmd.SetString(MODEL_TYPE_CD, model.Type);
                    cmd.SetString(MODEL_TITLE, model.Title);
                    cmd.SetValue(MODEL_TAG, NpgsqlTypes.NpgsqlDbType.Array | NpgsqlTypes.NpgsqlDbType.Text, model.Tags?.ToArray() ?? []);
                });
        }

        public async Task UpdateAll(List<Automatic1111.Common.Model> models) {
            var existingModels = await GetAll();

            models = models.Select(a => {
                a.title = a.title.Split(" ")[0];
                return a;
            }).ToList();

            var existingTitles = existingModels.Select(a=>a.Title).ToList();
            var availableTitles = models.Select(a => a.title).ToList();

            var newTitles = availableTitles.Except(existingTitles).ToList();
            var unavailableTitles = existingTitles.Except(availableTitles).ToList();

            var newModels = models.Where(a => newTitles.Contains(a.title)).ToList();
            
            // Mark every model available 
            await adoTemplate.Execute(UpdateSql([MODEL_AVAIL_IN], new() {
                { MODEL_AVAIL_IN, "TRUE"}
            }, MODELS_TABLE, new([])));

            //Mark unavailable models unavailable
            if (unavailableTitles.Count > 0) {
                await adoTemplate.Execute(UpdateSql([MODEL_AVAIL_IN], new() {
                    { MODEL_AVAIL_IN, "FALSE"}
                }, MODELS_TABLE, new([new(MODEL_TITLE, unavailableTitles)])));
            }

            //Check for unavailable models that have zero images and delete them
            var unusedModels = await GetUnusedModels();
            if (unusedModels.Count > 0) {
                Console.WriteLine($"{unusedModels.Count} model(s) unused and deleted");
                unusedModels.ForEach(m => Console.WriteLine($"    - {m}"));
                await adoTemplate.Execute(DeleteSql(MODELS_TABLE, new([new(MODEL_TITLE, unusedModels)])));
            }

            //Create the new models
            await adoTemplate.ExecuteBatch(InsertSql(
                [MODEL_NAME, MODEL_TITLE, MODEL_AVAIL_IN,MODEL_DESC],
                MODELS_TABLE
            ), (cmd,m) => {
                cmd.SetString(MODEL_NAME, m.model_name);
                cmd.SetString(MODEL_TITLE,m.title);
                cmd.SetBoolean(MODEL_AVAIL_IN, true);
                cmd.SetString(MODEL_DESC, "");
            },newModels);

            

        }

        #endregion

    }
}
