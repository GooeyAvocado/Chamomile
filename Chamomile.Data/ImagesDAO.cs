using Automatic1111.Common;
using Chamomile.API.Utils;
using Chamomile.Common;
using Hue.Common;
using MetadataExtractor;
using System.Text.RegularExpressions;
using static Chamomile.Data.Utils.AdoTemplate;
using static Chamomile.Data.Utils.Constants;
using static Chamomile.Data.Utils.SqlBuilder;

namespace Chamomile.Data {
    public class ImagesDAO(string connectionString) : BaseDAO(connectionString) {

        private LoraDAO loraDao = new(connectionString);

        private async Task<GeneratedImage> ImageRM(Getter reader) {
            return new() {
                Id = reader.GetInt(IMAGES_ID),
                Prompt = reader.GetString(IMAGES_PROMPT),
                NegativePrompt = reader.GetString(IMAGES_NEG_PROMPT),
                Steps = reader.GetInt(IMAGES_STEPS),
                Sampler = reader.GetString(IMAGES_SAMPLER),
                ScheduleType = reader.GetString(IMAGES_SCHEDULE_TP),
                CFGScale = reader.GetDouble(IMAGES_CFG_SCL),
                Seed = reader.GetLong(IMAGES_SEED),
                Height = reader.GetInt(IMAGES_HEIGHT),
                Width = reader.GetInt(IMAGES_WIDTH),
                Favorite = reader.GetBoolean(IMAGES_FAV_IN),
                Created = reader.GetDateTime(CRE_TS),
                Model = reader.GetString(MODEL_TITLE),
                Loras = await adoTemplate.Query(
                    SelectSql(
                        [LORA_ALIAS],
                        IMAGES_LORA_MAP,
                        new WhereConditionGroup([new(IMAGES_ID)])),
                        (cmd) => cmd.SetInt(IMAGES_ID, reader.GetInt(IMAGES_ID)),
                        (reader) => reader.GetString(LORA_ALIAS)
                    )
            };
        }

        #region CREATE

        public async Task<List<GeneratedImage>> SaveImage(Txt2ImgResponse response, string currentModel) {

            List<GeneratedImage> images = [];

            List<string> loras = Regex
                    .Matches(response.parameters.prompt, @"<lora:([^>:]+):([\d.]+)>")
                    .Select(a => a.Groups[1].Value).ToList();

            foreach (var image in response.images) {

                var img = await adoTemplate.QuerySingle(InsertSql([
                IMAGES_PROMPT, IMAGES_NEG_PROMPT, IMAGES_STEPS,
                IMAGES_SAMPLER, IMAGES_SCHEDULE_TP,IMAGES_CFG_SCL,
                IMAGES_SEED, IMAGES_HEIGHT, IMAGES_WIDTH, IMAGES_BYTES,MODEL_TITLE
            ], IMAGES_TABLE, string.Join(", ", [
                IMAGES_ID, IMAGES_PROMPT, IMAGES_NEG_PROMPT, IMAGES_STEPS,
                IMAGES_SAMPLER, IMAGES_SCHEDULE_TP,IMAGES_CFG_SCL,
                IMAGES_SEED, IMAGES_HEIGHT, IMAGES_WIDTH, IMAGES_FAV_IN,
                MODEL_TITLE, CRE_TS
            ])), (cmd) => {
                cmd.SetString(IMAGES_PROMPT, response.parameters.prompt);
                cmd.SetString(IMAGES_NEG_PROMPT, response.parameters.negative_prompt);
                cmd.SetInt(IMAGES_STEPS, response.parameters.steps);
                cmd.SetString(IMAGES_SAMPLER, response.parameters.sampler_name);
                cmd.SetString(IMAGES_SCHEDULE_TP, response.parameters.scheduler);
                cmd.SetDouble(IMAGES_CFG_SCL, response.parameters.cfg_scale);
                cmd.SetLong(IMAGES_SEED, response.parameters.seed);
                cmd.SetInt(IMAGES_HEIGHT, response.parameters.height);
                cmd.SetInt(IMAGES_WIDTH, response.parameters.width);
                cmd.SetBytea(IMAGES_BYTES, Convert.FromBase64String(image));
                cmd.SetString(MODEL_TITLE, currentModel);
            }, ImageRM);

                if (img == null) continue;

                img.Loras = loras;

                images.Add(img);

                await adoTemplate.ExecuteBatch(InsertSql([IMAGES_ID, LORA_ALIAS], IMAGES_LORA_MAP), (cmd, lora) => {
                    cmd.SetInt(IMAGES_ID, img.Id);
                    cmd.SetString(LORA_ALIAS, lora);
                }, loras);


            }

            return images;
        }

        public static string? ExtractStableDiffusionMetadata(Stream stream) {
            var directories = ImageMetadataReader.ReadMetadata(stream);

            foreach (var directory in directories) {
                foreach (var tag in directory.Tags) {
                    if (tag.Description?.StartsWith("parameters:", StringComparison.OrdinalIgnoreCase) ?? false) {
                        return tag.Description.Substring(11).Trim(); // This contains the raw generation parameters
                    }
                }
            }

            return null; // No metadata found
        }

        public async Task<GeneratedImage?> CreateImage(byte[] imageBytes) {

            var metadata = ExtractStableDiffusionMetadata(new MemoryStream(imageBytes));
            if (metadata == null) { throw new InvalidOperationException("Image is missing parameters!"); }
            var image = ParseUtils.ParametersToImage(metadata);

            var loras = await loraDao.GetAll();

            image.Loras = Regex
                    .Matches(image.Prompt, @"<lora:([^>:]+):([\d.]+)>")
                    .Select(a => a.Groups[1].Value)
                    .Where(a => loras.Any(b => b.Alias == a)) //Only with LORAs we have
                    .ToList() ;

            

            var model = image.Model.EndsWith("]") ? image.Model
                : await adoTemplate.QuerySingle(SelectSql([MODEL_TITLE], MODELS_TABLE,
                    new WhereConditionGroup([new(MODEL_NAME)])),
                        (cmd) => cmd.SetString(MODEL_NAME,image.Model),
                        (reader)=>reader.GetOptionalString(MODEL_TITLE)
                    );

            var img = await adoTemplate.QuerySingle(InsertSql([
                IMAGES_PROMPT, IMAGES_NEG_PROMPT, IMAGES_STEPS,
                IMAGES_SAMPLER, IMAGES_SCHEDULE_TP,IMAGES_CFG_SCL,
                IMAGES_SEED, IMAGES_HEIGHT, IMAGES_WIDTH, IMAGES_BYTES,MODEL_TITLE
            ], IMAGES_TABLE, string.Join(", ", [
                IMAGES_ID, IMAGES_PROMPT, IMAGES_NEG_PROMPT, IMAGES_STEPS,
                IMAGES_SAMPLER, IMAGES_SCHEDULE_TP,IMAGES_CFG_SCL,
                IMAGES_SEED, IMAGES_HEIGHT, IMAGES_WIDTH, IMAGES_FAV_IN,
                MODEL_TITLE, CRE_TS
            ])), (cmd) => {
                cmd.SetString(IMAGES_PROMPT, image.Prompt);
                cmd.SetString(IMAGES_NEG_PROMPT, image.NegativePrompt);
                cmd.SetInt(IMAGES_STEPS, image.Steps);
                cmd.SetString(IMAGES_SAMPLER, image.Sampler);
                cmd.SetString(IMAGES_SCHEDULE_TP, image.ScheduleType);
                cmd.SetDouble(IMAGES_CFG_SCL, image.CFGScale);
                cmd.SetLong(IMAGES_SEED, image.Seed);
                cmd.SetInt(IMAGES_HEIGHT, image.Height);
                cmd.SetInt(IMAGES_WIDTH, image.Width);
                cmd.SetBytea(IMAGES_BYTES, imageBytes);
                cmd.SetString(MODEL_TITLE, model);
            }, ImageRM);


            await adoTemplate.ExecuteBatch(InsertSql([IMAGES_ID, LORA_ALIAS], IMAGES_LORA_MAP), (cmd, lora) => {
                cmd.SetInt(IMAGES_ID, img.Id);
                cmd.SetString(LORA_ALIAS, lora);
            }, image.Loras);

            img.Loras = image.Loras;

            return img;
        }

        #endregion

        #region READ

        private static List<WhereCondition> ConditionsFromFilter(FilterOptions filter) {
            var conditions = new List<WhereCondition>();

            if (!string.IsNullOrEmpty(filter.Query)) {
                conditions.Add(new WhereConditionSubgroup(new(WhereConditionUnion.OR, [
                    new(IMAGES_PROMPT,WhereConditionOperator.ILIKE),
                    new(IMAGES_NEG_PROMPT,WhereConditionOperator.ILIKE)
                ])));
            }

            if (!string.IsNullOrEmpty(filter.Model)) {
                conditions.Add(new(MODEL_TITLE));
            }

            if (filter.Favorite == true) {
                conditions.Add(new(IMAGES_FAV_IN, WhereConditionOperator.EQUALS, "true"));
            }

            if (!string.IsNullOrEmpty(filter.Lora)) {
                conditions.Add(new(
                    IMAGES_ID, WhereConditionOperator.IN, "(" + SelectSql([IMAGES_ID], IMAGES_LORA_MAP, new WhereConditionGroup([new(LORA_ALIAS)])) + ")"
                ));
            }

            if (!string.IsNullOrEmpty(filter.FromDate)) {
                conditions.Add(new(CRE_TS, WhereConditionOperator.GREATER_THAN, "@FROM_DATE"));
            }

            if (!string.IsNullOrEmpty(filter.ToDate)) {
                conditions.Add(new(CRE_TS, WhereConditionOperator.LESS_THAN, "@TO_DATE"));
            }

            return conditions;
        }

        private static void SetterFromFilter(Setter cmd, FilterOptions filter) {
            if (!string.IsNullOrEmpty(filter.Query)) {
                cmd.SetString(IMAGES_PROMPT, "%" + filter.Query + "%");
                cmd.SetString(IMAGES_NEG_PROMPT, "%" + filter.Query + "%");
            }

            if (!string.IsNullOrEmpty(filter.Model)) { cmd.SetString(MODEL_TITLE, filter.Model); }
            if (!string.IsNullOrEmpty(filter.Lora)) { cmd.SetString(LORA_ALIAS, filter.Lora); }

            if (!string.IsNullOrEmpty(filter.FromDate)) {
                cmd.SetDate("FROM_DATE", DateTime.Parse(filter.FromDate));
            }

            if (!string.IsNullOrEmpty(filter.ToDate)) {
                cmd.SetDate("TO_DATE", DateTime.Parse(filter.ToDate));
            }
        }

        private const int PAGE_SIZE = 54;

        public async Task<List<GeneratedImage>> GetAll(FilterOptions filter, int page) {
            return await adoTemplate.Query(
                SelectSql([
                    IMAGES_ID, IMAGES_PROMPT, IMAGES_NEG_PROMPT, IMAGES_STEPS,
                    IMAGES_SAMPLER, IMAGES_SCHEDULE_TP,IMAGES_CFG_SCL,
                    IMAGES_SEED, IMAGES_HEIGHT, IMAGES_WIDTH, IMAGES_FAV_IN,
                    MODEL_TITLE, CRE_TS
                ],
                    IMAGES_TABLE,
                    new WhereConditionGroup(ConditionsFromFilter(filter)),
                    [new OrderBy(CRE_TS, SortOrder.DESC)],
                    PAGE_SIZE, PAGE_SIZE * page
                ),
                (cmd) => SetterFromFilter(cmd, filter), ImageRM
            );
        }

        public async Task<int> GetAllCount(FilterOptions filter) {
            return await adoTemplate.QuerySingle(SelectSql(["count(*)"], IMAGES_TABLE, new WhereConditionGroup(ConditionsFromFilter(filter))),
                    (cmd) => SetterFromFilter(cmd, filter), (reader) => reader.GetInt(0)
                );
        }

        public async Task<GeneratedImage?> Get(int id) {
            return await adoTemplate.QuerySingle(
                SelectSql([
                    IMAGES_ID, IMAGES_PROMPT, IMAGES_NEG_PROMPT, IMAGES_STEPS,
                    IMAGES_SAMPLER, IMAGES_SCHEDULE_TP,IMAGES_CFG_SCL,
                    IMAGES_SEED, IMAGES_HEIGHT, IMAGES_WIDTH, IMAGES_FAV_IN,
                    MODEL_TITLE ,CRE_TS
                ],
                    IMAGES_TABLE,
                    new WhereConditionGroup([new(IMAGES_ID)])
                ),
                (cmd) => cmd.SetInt(IMAGES_ID, id), ImageRM
            );
        }

        public async Task<ImageDownload?> GetImage(int id) {

            var sql = SelectSql(
                columns: [IMAGES_BYTES],
                table: IMAGES_TABLE,
                new WhereConditionGroup([
                    new(IMAGES_ID),
                ])
            );

            return await adoTemplate.QuerySingle(sql, (cmd) => {
                cmd.SetInt(IMAGES_ID, id);
            }, (reader) => new ImageDownload() {
                Filename = id + "",
                Mime = "image/png",
                Data = reader.GetOptionalBytea(IMAGES_BYTES),
            });
        }

        #endregion

        #region UPDATE

        public async Task<GeneratedImage?> Favorite(int id, bool fav) {
            var img = await Get(id);
            if (img == null) return null;

            await adoTemplate.Execute(UpdateSql([IMAGES_FAV_IN], IMAGES_TABLE, new([new(IMAGES_ID)])), (cmd) => {
                cmd.SetBoolean(IMAGES_FAV_IN, fav);
                cmd.SetInt(IMAGES_ID, id);
            });

            img.Favorite = true;
            return img;
        }

        #endregion

        #region DELETE

        public async Task Delete(int id) {
            await adoTemplate.Execute(UpdateSql([IMAGES_ID], MODELS_TABLE, new([new(IMAGES_ID, WhereConditionOperator.EQUALS, "@ORIGINAL_ID")])), (cmd) => {
                cmd.SetInt(IMAGES_ID, null);
                cmd.SetInt("ORIGINAL_ID", id);
            });
            await adoTemplate.Execute(UpdateSql([IMAGES_ID], LORA_TABLE, new([new(IMAGES_ID, WhereConditionOperator.EQUALS, "@ORIGINAL_ID")])), (cmd) => {
                cmd.SetInt(IMAGES_ID, null);
                cmd.SetInt("ORIGINAL_ID", id);
            });
            await adoTemplate.Execute(DeleteSql(IMAGES_LORA_MAP, new([new(IMAGES_ID)])), (cmd) => cmd.SetInt(IMAGES_ID, id));
            await adoTemplate.Execute(DeleteSql(IMAGES_TABLE, new([new(IMAGES_ID)])), (cmd) => cmd.SetInt(IMAGES_ID, id));
        }

        #endregion

    }
}
