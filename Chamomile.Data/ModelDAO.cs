using Chamomile.Common;
using static Chamomile.Data.Utils.SqlBuilder;
using static Chamomile.Data.Utils.Constants;

namespace Chamomile.Data {
    public class ModelDAO(string connectionString) : BaseDAO(connectionString) {

        #region READ

        public async Task<List<Model>> GetAll() {
            return await adoTemplate.Query(
                SelectSql([
                    MODEL_NAME, MODEL_TITLE, MODEL_AVAIL_IN,MODEL_DESC,IMAGES_ID],
                    MODELS_TABLE,
                    new([]),
                    [new OrderBy(MODEL_NAME)]
                ),
                (_) => { }, (reader) => new Model() {
                    Title = reader.GetString(MODEL_TITLE),
                    Name = reader.GetString(MODEL_NAME),
                    Description = reader.GetString(MODEL_DESC),
                    IsAvailable = reader.GetBoolean(MODEL_AVAIL_IN),
                    BannerImage = reader.GetOptionalInt(IMAGES_ID)
                }
            );
        
        }

        #endregion

        #region UPDATE

        public async Task Update(Model model) {
            await adoTemplate.Execute(
                UpdateSql(
                    [MODEL_DESC, IMAGES_ID],
                    MODELS_TABLE,
                    new([new(MODEL_TITLE)])
                ), (cmd) => {
                    cmd.SetString(MODEL_DESC, model.Description);
                    cmd.SetInt(IMAGES_ID, model.BannerImage);
                    cmd.SetString(MODEL_TITLE, model.Title);
                });
        }

        public async Task UpdateAll(List<Automatic1111.Common.Model> models) {
            var existingModels = await GetAll();
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
