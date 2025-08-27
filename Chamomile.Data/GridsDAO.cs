using Chamomile.Common;
using static Chamomile.Data.Utils.AdoTemplate;
using static Chamomile.Data.Utils.SqlBuilder;
using static Chamomile.Data.Utils.Constants;


namespace Chamomile.Data {
    public class GridsDAO(string connectionString) : BaseDAO(connectionString) {

        private static readonly List<string> GridColumns = [
           GRID_ID,GRID_NM, GRID_PROMPT_TX, GRID_NOTES_TX, GRID_NEGATIVE_PROMPT_TX,
            GRID_STEP_CNT, GRID_SAMPLER_TX, GRID_SCHEDULE_TP, GRID_CFG_SCL_NUM,
            GRID_SEED_NUM, GRID_HGHT_NUM, GRID_WDTH_NUM, GRID_GENERATION_DURATION_MS,
            GRID_XVAL_CD, GRID_XVAL, GRID_YVAL_CD, GRID_YVAL, CRE_TS
        ];

        private async Task<Grid> GridRM(Getter reader) {
            return new Grid {
                Id = reader.GetInt(GRID_ID),
                Name = reader.GetString(GRID_NM),
                Prompt = reader.GetString(GRID_PROMPT_TX),
                Notes = reader.GetString(GRID_NOTES_TX),
                NegativePrompt = reader.GetString(GRID_NEGATIVE_PROMPT_TX),
                Steps = reader.GetInt(GRID_STEP_CNT),
                Sampler = reader.GetString(GRID_SAMPLER_TX),
                ScheduleType = reader.GetString(GRID_SCHEDULE_TP),
                CFGScale = reader.GetDouble(GRID_CFG_SCL_NUM),
                Seed = reader.GetLong(GRID_SEED_NUM),
                Height = reader.GetInt(GRID_HGHT_NUM),
                Width = reader.GetInt(GRID_WDTH_NUM),
                GenerationDurationMs = reader.GetInt(GRID_GENERATION_DURATION_MS),
                XValMode = reader.GetString(GRID_XVAL_CD),
                XVals = [.. (reader.GetValue(GRID_XVAL) as string[] ?? [])],
                YValMode = reader.GetString(GRID_YVAL_CD),
                YVals = [.. (reader.GetValue(GRID_YVAL) as string[] ?? [])],
                Created = reader.GetDateTime(CRE_TS),
                FirstFour = await adoTemplate.Query(SelectSql([IMAGES_ID],IMAGES_TABLE,new WhereConditionGroup([new(IMAGE_ADDTL_INFO + "->> 'GridId'", WhereConditionOperator.EQUALS, "@" + GRID_ID)])) + " LIMIT 4", (cmd) => {
                    cmd.SetInt(GRID_ID, reader.GetInt(GRID_ID));
                }, (rm)=>rm.GetInt(0))

            };
        }

        #region CREATE

        public async Task<Grid?> Create(Grid grid) {
            return await adoTemplate.QuerySingle(InsertSql([
                GRID_NM, GRID_PROMPT_TX, GRID_NOTES_TX, GRID_NEGATIVE_PROMPT_TX,
                GRID_STEP_CNT, GRID_SAMPLER_TX, GRID_SCHEDULE_TP, GRID_CFG_SCL_NUM,
                GRID_SEED_NUM, GRID_HGHT_NUM, GRID_WDTH_NUM, GRID_GENERATION_DURATION_MS,
                GRID_XVAL_CD, GRID_XVAL, GRID_YVAL_CD, GRID_YVAL
                ], GRID_TABLE, "*"), (cmd) => {
                    cmd.SetString(GRID_NM, grid.Name);
                    cmd.SetString(GRID_PROMPT_TX, grid.Prompt);
                    cmd.SetString(GRID_NOTES_TX, grid.Notes);
                    cmd.SetString(GRID_NEGATIVE_PROMPT_TX, grid.NegativePrompt);
                    cmd.SetInt(GRID_STEP_CNT, grid.Steps);
                    cmd.SetString(GRID_SAMPLER_TX, grid.Sampler);
                    cmd.SetString(GRID_SCHEDULE_TP, grid.ScheduleType);
                    cmd.SetDouble(GRID_CFG_SCL_NUM, grid.CFGScale);
                    cmd.SetLong(GRID_SEED_NUM, grid.Seed);
                    cmd.SetInt(GRID_HGHT_NUM, grid.Height);
                    cmd.SetInt(GRID_WDTH_NUM, grid.Width);
                    cmd.SetInt(GRID_GENERATION_DURATION_MS, grid.GenerationDurationMs);
                    cmd.SetString(GRID_XVAL_CD, grid.XValMode);
                    cmd.SetValue(GRID_XVAL, NpgsqlTypes.NpgsqlDbType.Array | NpgsqlTypes.NpgsqlDbType.Text, grid.XVals?.ToArray() ?? []);
                    cmd.SetString(GRID_YVAL_CD, grid.YValMode);
                    cmd.SetValue(GRID_YVAL, NpgsqlTypes.NpgsqlDbType.Array | NpgsqlTypes.NpgsqlDbType.Text, grid.YVals?.ToArray() ?? []);
                }, GridRM);
        }

        #endregion

        #region READ

        public async Task<List<Grid>> GetAll() {
            return await adoTemplate.Query($"select * from {GRID_TABLE} ORDER BY {GRID_NM}", (cmd) => { }, GridRM);
        }

        public async Task<Grid?> Get(int Id) {
            return await adoTemplate.QuerySingle(SelectSql(GridColumns, GRID_TABLE, new WhereConditionGroup([new(GRID_ID)])), (cmd) => {
                cmd.SetInt(GRID_ID, Id);
            }, GridRM);
        }

        #endregion

        #region UPDATE

        public async Task<Grid?> Update(Grid grid) {
            return await adoTemplate.QuerySingle(UpdateSql([GRID_NM, GRID_NOTES_TX], GRID_TABLE, new WhereConditionGroup([new(GRID_ID)])) + " RETURNING *", (cmd) => {
                    cmd.SetInt(GRID_ID, grid.Id);
                    cmd.SetString(GRID_NM, grid.Name);
                    cmd.SetString(GRID_NOTES_TX, grid.Notes);
                }, GridRM);
        }

        #endregion

        #region DELETE
        public async Task Delete(int Id) {
            
            //First, delete all the images that were in this grid

            await adoTemplate.Execute(DeleteSql(IMAGES_TABLE, new([new(IMAGE_ADDTL_INFO + "->> 'GridId'",WhereConditionOperator.EQUALS, "@" + GRID_ID)])), (cmd) => {
                cmd.SetInt(GRID_ID, Id);
            });

            //Then delete the grid
            await adoTemplate.Execute(DeleteSql(GRID_TABLE, new([new(GRID_ID)])), (cmd) => {
                cmd.SetInt(GRID_ID, Id);
            });
        }


        #endregion

    }
}
