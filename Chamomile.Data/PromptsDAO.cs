using Chamomile.Common;
using static Chamomile.Data.Utils.AdoTemplate;
using static Chamomile.Data.Utils.Constants;
using static Chamomile.Data.Utils.SqlBuilder;

namespace Chamomile.Data {
    public class PromptsDAO(string connectionString) : BaseDAO(connectionString) {

        private Prompt PromptRM(Getter reader) {
            return new() {
                Id = reader.GetInt(PROMPT_ID),
                PositivePrompt = reader.GetString(PROMPT_PROMPT),
                NegativePrompt = reader.GetString(PROMPT_NEG_PROMPT),
                Steps = reader.GetInt(PROMPT_STEPS),
                Sampler = reader.GetString(PROMPT_SAMPLER),
                ScheduleType = reader.GetString(PROMPT_SCHEDULE_TP),
                CFGScale = reader.GetDouble(PROMPT_CFG_SCL),
                Height = reader.GetInt(PROMPT_HEIGHT),
                Width = reader.GetInt(PROMPT_WIDTH),
                Name = reader.GetString(PROMPT_NAME),
                SampleImage = reader.GetOptionalInt(IMAGES_ID),
            };
        }

        #region CREATE

        public async Task Create(Prompt prompt) {
            await adoTemplate.Execute(InsertSql([
                PROMPT_PROMPT,PROMPT_NEG_PROMPT,PROMPT_STEPS,
                PROMPT_SAMPLER, PROMPT_SCHEDULE_TP, PROMPT_CFG_SCL,
                PROMPT_HEIGHT, PROMPT_WIDTH, PROMPT_NAME,
                IMAGES_ID
            ], PROMPT_TABLE), (cmd) => {
                cmd.SetString(PROMPT_PROMPT,prompt.PositivePrompt);
                cmd.SetString(PROMPT_NEG_PROMPT,prompt.NegativePrompt);
                cmd.SetInt(PROMPT_STEPS,prompt.Steps);
                cmd.SetString(PROMPT_SAMPLER,prompt.Sampler);
                cmd.SetString(PROMPT_SCHEDULE_TP,prompt.ScheduleType);
                cmd.SetDouble(PROMPT_CFG_SCL,prompt.CFGScale);
                cmd.SetInt(PROMPT_HEIGHT,prompt.Height);
                cmd.SetInt(PROMPT_WIDTH,prompt.Width);
                cmd.SetString(PROMPT_NAME,prompt.Name);
                cmd.SetInt(IMAGES_ID,prompt.SampleImage);
            });
        }

        #region UPDATE

        public async Task Update(Prompt prompt) {
            await adoTemplate.Execute(UpdateSql([
                PROMPT_PROMPT,PROMPT_NEG_PROMPT,PROMPT_STEPS,
                PROMPT_SAMPLER, PROMPT_SCHEDULE_TP, PROMPT_CFG_SCL,
                PROMPT_HEIGHT, PROMPT_WIDTH, PROMPT_NAME,
                IMAGES_ID
            ], PROMPT_TABLE, new([new(PROMPT_ID)])), (cmd) => {
                cmd.SetInt(PROMPT_ID, prompt.Id);
                cmd.SetString(PROMPT_PROMPT, prompt.PositivePrompt);
                cmd.SetString(PROMPT_NEG_PROMPT, prompt.NegativePrompt);
                cmd.SetInt(PROMPT_STEPS, prompt.Steps);
                cmd.SetString(PROMPT_SAMPLER, prompt.Sampler);
                cmd.SetString(PROMPT_SCHEDULE_TP, prompt.ScheduleType);
                cmd.SetDouble(PROMPT_CFG_SCL, prompt.CFGScale);
                cmd.SetInt(PROMPT_HEIGHT, prompt.Height);
                cmd.SetInt(PROMPT_WIDTH, prompt.Width);
                cmd.SetString(PROMPT_NAME, prompt.Name);
                cmd.SetInt(IMAGES_ID, prompt.SampleImage);
            });
        }

        #endregion

        #endregion

        #region READ

        public async Task<List<Prompt>> GetAll() {
            return await adoTemplate.Query(
                SelectSql([
                    PROMPT_PROMPT,PROMPT_NEG_PROMPT,PROMPT_STEPS,
                    PROMPT_SAMPLER, PROMPT_SCHEDULE_TP, PROMPT_CFG_SCL,
                    PROMPT_HEIGHT, PROMPT_WIDTH, PROMPT_NAME, PROMPT_ID,
                    IMAGES_ID
                ],
                    PROMPT_TABLE,
                    new WhereConditionGroup([]),
                    [new OrderBy(PROMPT_NAME)]
                ),
                (_) => { }, PromptRM
            );
        }

        public async Task<Prompt?> Get(int id) {
            return await adoTemplate.QuerySingle(
                SelectSql([
                     PROMPT_PROMPT,PROMPT_NEG_PROMPT,PROMPT_STEPS,
                    PROMPT_SAMPLER, PROMPT_SCHEDULE_TP, PROMPT_CFG_SCL,
                    PROMPT_HEIGHT, PROMPT_WIDTH, PROMPT_NAME, PROMPT_ID,
                    IMAGES_ID
                ],
                    PROMPT_TABLE,
                    new WhereConditionGroup([new(PROMPT_ID)])
                ),
                (cmd) => cmd.SetInt(PROMPT_ID, id), PromptRM
            );
        }

        #endregion

        #region DELETE

        public async Task Delete(int id) {
            await adoTemplate.Execute(DeleteSql(PROMPT_TABLE, new([new(PROMPT_ID)])), (cmd) => cmd.SetInt(PROMPT_ID, id));
        }

        #endregion

    }
}
