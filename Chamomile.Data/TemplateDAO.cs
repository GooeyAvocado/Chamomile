using Chamomile.Common;
using System.Text.Json;
using static Chamomile.Data.Utils.AdoTemplate;
using static Chamomile.Data.Utils.Constants;
using static Chamomile.Data.Utils.SqlBuilder;

namespace Chamomile.Data {
    public class TemplateDAO(string connectionString) : BaseDAO(connectionString) {

        static readonly List<string> TemplateColumns = [TEMPLATE_NAME, TEMPLATE_DESC, TEMPLATE_PARAMS, TEMPLATE_TEXT, IMAGES_ID];
        static readonly JsonSerializerOptions SerializationOptions = new() {
            
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        };

        private static Template TemplateRM(Getter reader) {
            return new() {
               Name = reader.GetString(TEMPLATE_NAME),
               Description = reader.GetString(TEMPLATE_DESC),
                TemplateString = reader.GetString(TEMPLATE_TEXT),
                SampleImage = reader.GetOptionalInt(IMAGES_ID),
                Params = JsonSerializer.Deserialize<List<Template.TemplateParam>>(reader.GetOptionalString(TEMPLATE_PARAMS) ?? "[]") ?? []
            };
        }

        //CREATE
        public async Task<Template> Create(Template template) {
            return await adoTemplate.QuerySingle(InsertSql(TemplateColumns
                , TEMPLATE_TABLE, string.Join(", ", TemplateColumns)), (cmd) => {
                cmd.SetString(TEMPLATE_NAME, template.Name);
                cmd.SetString(TEMPLATE_DESC, template.Description);
                cmd.SetString(TEMPLATE_TEXT, template.TemplateString);
                cmd.SetInt(IMAGES_ID, template.SampleImage);
                cmd.SetValue(TEMPLATE_PARAMS, NpgsqlTypes.NpgsqlDbType.Jsonb, JsonSerializer.Serialize(template.Params, SerializationOptions));
            }, TemplateRM) ?? throw new InvalidOperationException("This should never happen");
        }

        //READ
        public async Task<List<Template>> GetAll() {
            return await adoTemplate.Query(
                SelectSql(TemplateColumns, TEMPLATE_TABLE) + $" ORDER BY {TEMPLATE_NAME}", 
                (cmd) => { }, 
                TemplateRM
            );
        }

        public async Task<Template?> Get(string name) {
            return await adoTemplate.QuerySingle(
                SelectSql(TemplateColumns, TEMPLATE_TABLE, new WhereConditionGroup([new(TEMPLATE_NAME, WhereConditionOperator.ILIKE)])),
                (cmd) => cmd.SetString(TEMPLATE_NAME, name),
                TemplateRM
            );
        }

        public async Task<string> GetAndApply(string name, List<string> paramList) {

            var template = await Get(name);
            return template == null
                ? ""
                : template.Params
                .Select((p, i) => new {
                    Index = i + 1,
                    Value = (i < paramList.Count && !string.IsNullOrWhiteSpace(paramList[i]))
                        ? paramList[i]
                        : p.Default
                })
                .Aggregate(template.TemplateString, (acc, x) =>
                    acc.Replace($"~{x.Index}", x.Value)
                );
        }

        //UPDATE

        public async Task<Template?> Update(Template template) {
            return await adoTemplate.QuerySingle(UpdateSql(TemplateColumns,TEMPLATE_TABLE, new([new(TEMPLATE_NAME)])) 
                + $" RETURNING {string.Join(", ",TemplateColumns)}", (cmd) => {
                    cmd.SetString(TEMPLATE_NAME, template.Name);
                    cmd.SetString(TEMPLATE_DESC, template.Description);
                    cmd.SetString(TEMPLATE_TEXT, template.TemplateString);
                    cmd.SetInt(IMAGES_ID, template.SampleImage);
                    cmd.SetValue(TEMPLATE_PARAMS, NpgsqlTypes.NpgsqlDbType.Jsonb, JsonSerializer.Serialize(template.Params, SerializationOptions));
                }, TemplateRM);
        }

        //DELETE
        public async Task Delete(string name) {
            await adoTemplate.Execute(DeleteSql(TEMPLATE_TABLE, new([new(TEMPLATE_NAME)])),cmd=>cmd.SetString(TEMPLATE_NAME,name));
        }


    }
}
