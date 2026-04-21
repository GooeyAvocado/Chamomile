using Chamomile.Common;
using static Chamomile.Data.Utils.SqlBuilder;
using static Chamomile.Data.Utils.Constants;

namespace Chamomile.Data {
    public class CheckpointDAO(string connectionString) : BaseDAO(connectionString) {

        #region READ

        public async Task<List<Model>> GetAll() {
            return await adoTemplate.Query(
                SelectSql([
                    CHECKPOINT_NAME, CHECKPOINT_TITLE, CHECKPOINT_AVAIL_IN,CHECKPOINT_DESC,IMAGES_ID,CHECKPOINT_TYPE_CD, CHECKPOINT_TAG],
                    CHECKPOINTS_TABLE,
                    new([]),
                    [new OrderBy(CHECKPOINT_NAME)]
                ),
                (_) => { }, (reader) => new Model() {
                    ID = reader.GetString(CHECKPOINT_TITLE),
                    Name = reader.GetString(CHECKPOINT_NAME),
                    Type = reader.GetOptionalString(CHECKPOINT_TYPE_CD),
                    Description = reader.GetString(CHECKPOINT_DESC),
                    IsAvailable = reader.GetBoolean(CHECKPOINT_AVAIL_IN),
                    BannerImage = reader.GetOptionalInt(IMAGES_ID),
                    Tags= [.. (reader.GetValue(CHECKPOINT_TAG) as string[] ?? [])],
                }
            );
        
        }

        public async Task<List<string>> GetAllTags() {
            var tags = "TAGS";
            return await adoTemplate.Query(
                SelectSql([$"unnest({CHECKPOINT_TAG}) as {tags}"], CHECKPOINTS_TABLE, true),
                (cmd) => { },
                (reader) => reader.GetString(tags)
            );
        }

        public async Task<List<KeywordUsage>> GetUsage(FilterOptions filter, int limit) {
            return await adoTemplate.Query(SelectSql(
                [
                    $"{CHECKPOINT_TITLE}", 
                    $"count(*) as {EXISTING_CT}",
                    $"max({DELETED_CT}) as {DELETED_CT}",
                    $"count(*) filter(where {IMAGES_DOWNLOAD_CT} > 0) as {DOWNLOAD_CT}",
                    $"count(*) filter(where {IMAGES_FAV_IN}) as {FAVORITE_CT}",
                    $"count(*) filter(where {IMAGES_HIRES_IN}) as {UPSCALE_CT}",
                    $"min({CRE_TS}) as {MIN_TS}" ,
                    $"max({CRE_TS}) as {MAX_TS}"
                ], 
                "(" + UsageInnerImageSql(filter,limit) + ")" ) 
                + $" GROUP BY {CHECKPOINT_TITLE} ORDER BY {EXISTING_CT} DESC, {CHECKPOINT_TITLE}", (cmd) =>{
                    ImagesDAO.SetterFromFilter(cmd, filter);
                }, (reader) => 
                new KeywordUsage() { 
                    Keyword = reader.GetString(CHECKPOINT_TITLE),
                    Count= reader.GetInt(EXISTING_CT),
                    DeletedCount= reader.GetInt(DELETED_CT),
                    DownloadCount= reader.GetInt(DOWNLOAD_CT),
                    FavoriteCount= reader.GetInt(FAVORITE_CT),
                    UpscaleCount= reader.GetInt(UPSCALE_CT),
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
                    $"count(*) as {USAGE_COUNT}",
                    $"SUM(count(*)) OVER (ORDER BY date({CRE_TS}) ASC) AS {CUMULATIVE_USAGE_COUNT}",
                    $"min({IMAGES_ID}) as {IMAGES_ID}" ,
                ],
                "(" + DatedInnerImageSql(filter, limit) + ")")
                + $@" 
                    WHERE {CHECKPOINT_TITLE} = @{CHECKPOINT_TITLE}
                    GROUP BY {KEYWORD_USAGE_DATE} 
                    ORDER BY {KEYWORD_USAGE_DATE} ASC
                ", (cmd) => {
                    ImagesDAO.SetterFromFilter(cmd, filter);
                    cmd.SetString(CHECKPOINT_TITLE, model);
                }, (reader) =>
                new KeywordUsageDated() {
                    Keyword = model,
                    Count = reader.GetInt(USAGE_COUNT),
                    CumulativeCount= reader.GetInt(CUMULATIVE_USAGE_COUNT),
                    Date = reader.GetDateTime(KEYWORD_USAGE_DATE),
                    Sample = reader.GetInt(IMAGES_ID)
                }
            );
        }
                
        private async Task<List<string>> GetUnusedModels() {
            return await adoTemplate.Query($@"
                select m.{CHECKPOINT_TITLE}
                from {CHECKPOINTS_TABLE} m left join {IMAGES_TABLE} on m.{CHECKPOINT_TITLE} = img.{CHECKPOINT_TITLE} 
                where {CHECKPOINT_AVAIL_IN}  = false
                group by  m.{CHECKPOINT_TITLE}
                HAVING COUNT(img.{CHECKPOINT_TITLE}) = 0", (cmd) => { }, (reader) => reader.GetString(CHECKPOINT_TITLE));
        }

        private static string UsageInnerImageSql(FilterOptions filter, int limit) {
            return SelectSql([
                    $"m.{CHECKPOINT_TITLE}", 
                    $"m.{DELETED_CT}",
                    $"img.{IMAGES_ID}",
                    $"img.{CRE_TS}",
                    $"img.{IMAGES_DOWNLOAD_CT}",
                    $"img.{IMAGES_FAV_IN}",
                    $"img.{IMAGES_HIRES_IN}",
                ], 
                $"{CHECKPOINTS_TABLE} m left join {IMAGES_TABLE} on m.{CHECKPOINT_TITLE} = img.{CHECKPOINT_TITLE}",
                new WhereConditionGroup(ImagesDAO.ConditionsFromFilter(filter, 0)),
                [new OrderBy(CRE_TS, SortOrder.DESC)]) + (limit > 0 ? " LIMIT " + limit : "");
        }

        private static string DatedInnerImageSql(FilterOptions filter, int limit) {
            return SelectSql([CHECKPOINT_TITLE, CRE_TS, IMAGES_ID], IMAGES_TABLE, new WhereConditionGroup(ImagesDAO.ConditionsFromFilter(filter, 0)),
                [new OrderBy(CRE_TS, SortOrder.DESC)]) + (limit > 0 ? " LIMIT " + limit : "");
        }

        #endregion

        #region UPDATE

        public async Task Update(Model checkpoint) {
            await adoTemplate.Execute(
                UpdateSql(
                    [CHECKPOINT_DESC, IMAGES_ID, CHECKPOINT_TYPE_CD, CHECKPOINT_TAG],
                    CHECKPOINTS_TABLE,
                    new([new(CHECKPOINT_TITLE)])
                ), (cmd) => {
                    cmd.SetString(CHECKPOINT_DESC, checkpoint.Description);
                    cmd.SetInt(IMAGES_ID, checkpoint.BannerImage);
                    cmd.SetString(CHECKPOINT_TYPE_CD, checkpoint.Type);
                    cmd.SetString(CHECKPOINT_TITLE, checkpoint.ID);
                    cmd.SetValue(CHECKPOINT_TAG, NpgsqlTypes.NpgsqlDbType.Array | NpgsqlTypes.NpgsqlDbType.Text, checkpoint.Tags?.ToArray() ?? []);
                });
        }

        public async Task UpdateAll(List<Automatic1111.Common.Checkpoint> models) {
            var existingModels = await GetAll();

            models = models.Select(a => {
                a.title = a.title.Split(" ")[0];
                return a;
            }).ToList();

            var existingTitles = existingModels.Select(a=>a.ID).ToList();
            var availableTitles = models.Select(a => a.title).ToList();

            var newTitles = availableTitles.Except(existingTitles).ToList();
            var unavailableTitles = existingTitles.Except(availableTitles).ToList();

            var newModels = models.Where(a => newTitles.Contains(a.title)).ToList();
            
            // Mark every model available 
            await adoTemplate.Execute(UpdateSql([CHECKPOINT_AVAIL_IN], new() {
                { CHECKPOINT_AVAIL_IN, "TRUE"}
            }, CHECKPOINTS_TABLE, new([])));

            //Mark unavailable models unavailable
            if (unavailableTitles.Count > 0) {
                await adoTemplate.Execute(UpdateSql([CHECKPOINT_AVAIL_IN], new() {
                    { CHECKPOINT_AVAIL_IN, "FALSE"}
                }, CHECKPOINTS_TABLE, new([new(CHECKPOINT_TITLE, unavailableTitles)])));
            }

            //Check for unavailable models that have zero images and delete them
            var unusedModels = await GetUnusedModels();
            if (unusedModels.Count > 0) {
                Console.WriteLine($"{unusedModels.Count} model(s) unused and deleted");
                unusedModels.ForEach(m => Console.WriteLine($"    - {m}"));
                await adoTemplate.Execute(DeleteSql(CHECKPOINTS_TABLE, new([new(CHECKPOINT_TITLE, unusedModels)])));
            }

            //Create the new models
            await adoTemplate.ExecuteBatch(InsertSql(
                [CHECKPOINT_NAME, CHECKPOINT_TITLE, CHECKPOINT_AVAIL_IN,CHECKPOINT_DESC],
                CHECKPOINTS_TABLE
            ), (cmd,m) => {
                cmd.SetString(CHECKPOINT_NAME, m.model_name);
                cmd.SetString(CHECKPOINT_TITLE,m.title);
                cmd.SetBoolean(CHECKPOINT_AVAIL_IN, true);
                cmd.SetString(CHECKPOINT_DESC, "");
            },newModels);

            

        }

        #endregion

    }
}
