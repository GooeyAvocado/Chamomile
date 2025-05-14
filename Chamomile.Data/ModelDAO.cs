using Chamomile.Common;
using static Chamomile.Data.Utils.SqlBuilder;
using static Chamomile.Data.Utils.Constants;

namespace Chamomile.Data {
    public class ModelDAO(string connectionString) : BaseDAO(connectionString) {

        #region READ

        public async Task<List<Model>> GetAll() {
            return await adoTemplate.Query(
                SelectSql([
                    MODEL_NAME, MODEL_TITLE, MODEL_AVAIL_IN,MODEL_DESC,IMAGES_ID,MODEL_TYPE_CD],
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
                    BannerImage = reader.GetOptionalInt(IMAGES_ID)
                }
            );
        
        }

        public async Task<List<Usage>> GetUsage(FilterOptions filter, int limit) {
            return await adoTemplate.Query(SelectSql(
                [MODEL_TITLE, "count(*) as " + MODEL_USAGE_COUNT], 
                "(" + InnerImageSql(filter,limit) + ")" ) 
                + $" GROUP BY {MODEL_TITLE} ORDER BY {MODEL_USAGE_COUNT} DESC", (cmd) =>{
                    ImagesDAO.SetterFromFilter(cmd, filter);
                }, (reader) => 
                new Usage() { 
                    name = reader.GetString(MODEL_TITLE),
                    count= reader.GetInt(MODEL_USAGE_COUNT)
                }
            );
        }

        private static string InnerImageSql(FilterOptions filter, int limit) {
            return SelectSql([MODEL_TITLE], IMAGES_TABLE, new WhereConditionGroup(ImagesDAO.ConditionsFromFilter(filter, 0)),
                [new OrderBy(CRE_TS, SortOrder.DESC)]) + (limit > 0 ? " LIMIT " + limit : "");
        }

        #endregion

        #region UPDATE

        public async Task Update(Model model) {
            await adoTemplate.Execute(
                UpdateSql(
                    [MODEL_DESC, IMAGES_ID, MODEL_TYPE_CD],
                    MODELS_TABLE,
                    new([new(MODEL_TITLE)])
                ), (cmd) => {
                    cmd.SetString(MODEL_DESC, model.Description);
                    cmd.SetInt(IMAGES_ID, model.BannerImage);
                    cmd.SetString(MODEL_TYPE_CD, model.Type);
                    cmd.SetString(MODEL_TITLE, model.Title);
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
