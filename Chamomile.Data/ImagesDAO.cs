using Chamomile.API.Utils;
using Chamomile.Common;
using Chamomile.Common.Exceptions;
using MetadataExtractor;
using System.Text.Json;
using System.Text.RegularExpressions;
using static Chamomile.Data.Utils.AdoTemplate;
using static Chamomile.Data.Utils.Constants;
using static Chamomile.Data.Utils.SqlBuilder;

namespace Chamomile.Data {
    public partial class ImagesDAO(string connectionString) : BaseDAO(connectionString) {

        private readonly LoraDAO loraDao = new(connectionString);

        private static readonly List<string> ImageColumns = [IMAGES_ID, IMAGES_PROMPT, IMAGES_BASE_PROMPT, IMAGES_NEG_PROMPT, IMAGES_STEPS,
                IMAGES_SAMPLER, IMAGES_SCHEDULE_TP, IMAGES_CFG_SCL, IMAGES_DOWNLOAD_CT, IMAGES_NOTES,
                IMAGES_SEED, IMAGES_HEIGHT, IMAGES_WIDTH, IMAGES_FAV_IN, IMAGES_HIRES_IN, IMAGE_SIZE,
                MODEL_TITLE, CRE_TS, IMAGE_GEN_MS, IMAGE_HIDDEN,IMAGE_ADDTL_INFO];

        private async Task<GeneratedImage> ImageRM(Getter reader) {
            return new() {
                Id = reader.GetInt(IMAGES_ID),
                Prompt = reader.GetString(IMAGES_PROMPT),
                BasePrompt = reader.GetOptionalString(IMAGES_BASE_PROMPT),
                Notes = reader.GetOptionalString(IMAGES_NOTES),
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
                HiResAvailable = reader.GetBoolean(IMAGES_HIRES_IN),
                GenerationDurationMs = reader.GetOptionalInt(IMAGE_GEN_MS),
                DownloadCount = reader.GetOptionalInt(IMAGES_DOWNLOAD_CT),
                Size = reader.GetInt(IMAGE_SIZE),
                Hidden = reader.GetBoolean(IMAGE_HIDDEN),
                additionalInfo = JsonSerializer.Deserialize<Dictionary<string, object>>(reader.GetOptionalString(IMAGE_ADDTL_INFO) ?? "{}") ,


                Loras = await adoTemplate.Query(
                    SelectSql(
                        [LORA_ALIAS],
                        IMAGES_LORA_MAP,
                        new WhereConditionGroup([new(IMAGES_ID)])),
                        (cmd) => cmd.SetInt(IMAGES_ID, reader.GetInt(IMAGES_ID)),
                        (reader) => reader.GetString(LORA_ALIAS)
                    ),

                Albums = await adoTemplate.Query(
                    SelectSql(
                        [ALBUM_ID],
                        ALBUM_MAP,
                        new WhereConditionGroup([new(IMAGES_ID)])),
                        (cmd) => cmd.SetInt(IMAGES_ID, reader.GetInt(IMAGES_ID)),
                        (reader) => reader.GetInt(ALBUM_ID)
                    )
            };
        }

        private Album AlbumMetaRM(Getter reader) {
            return new() {
                Id = reader.GetInt(ALBUM_ID),
                Count = reader.GetInt(ALBUM_COUNT),
                Name = reader.GetString(ALBUM_NAME),
                SearchQuery = reader.GetString(ALBUM_QUERY),
                ThumbId = reader.GetOptionalInt(ALBUM_THUMB),
                FirstFourImages = reader.IsNull(ALBUM_SAMPLE_IDS) ? [] : new((int[])reader.GetOptionalValue(ALBUM_SAMPLE_IDS)!),
                Newest = reader.GetOptionalDateTime(MAX_TS),
                Oldest = reader.GetOptionalDateTime(MIN_TS),
                HideFromTimeline = reader.GetBoolean(ALBUM_HIDDEN_IN)
            };
        }

        private Album AlbumRM(Getter reader) {
            return new() {
                Id = reader.GetInt(ALBUM_ID),
                Name = reader.GetString(ALBUM_NAME),
                HideFromTimeline = reader.GetBoolean(ALBUM_HIDDEN_IN),
                SearchQuery = reader.GetString(ALBUM_QUERY),
                ThumbId = reader.GetOptionalInt(ALBUM_THUMB),
            };
        }


        #region CREATE

        public static string? ExtractStableDiffusionMetadata(Stream stream) {
            var directories = ImageMetadataReader.ReadMetadata(stream);

            foreach (var directory in directories) {
                foreach (var tag in directory.Tags) {
                    if (tag.Description?.StartsWith("parameters:", StringComparison.OrdinalIgnoreCase) ?? false) {
                        return tag.Description[11..].Trim(); // This contains the raw generation parameters
                    }
                }
            }

            return null; // No metadata found
        }

        public async Task<GeneratedImage> ParseImage(byte[] imageBytes) {
            var metadata = ExtractStableDiffusionMetadata(new MemoryStream(imageBytes)) ?? throw new InvalidOperationException("Image is missing parameters!");
            var image = ParseUtils.ParametersToImage(metadata);

            var loras = await loraDao.GetAll();

            image.Loras = [.. LoraRegex().Matches(image.Prompt)
                    .Select(a => a.Groups[1].Value)
                    .Where(a => loras.Any(b => b.Alias == a))];

            var model = await adoTemplate.QuerySingle(SelectSql([MODEL_TITLE], MODELS_TABLE,
                new WhereConditionGroup([new(MODEL_NAME, WhereConditionOperator.ILIKE)])),
                (cmd) => cmd.SetString(MODEL_NAME, "%" + image.Model + "%"),
                (reader) => reader.GetOptionalString(MODEL_TITLE)
            ) ?? "";

            if(model == "") {
                //We didn't find the model but we can actually probably add it
                var newModel = new Model() {
                    Title = image.Model + ".safetensors",
                    Description = "Model added from image upload",
                    IsAvailable = false,
                    Name = image.Model
                };
                await adoTemplate.Execute(InsertSql([MODEL_TITLE, MODEL_DESC, MODEL_AVAIL_IN, MODEL_NAME], MODELS_TABLE), (cmd) => {
                    cmd.SetString(MODEL_TITLE, newModel.Title);
                    cmd.SetString(MODEL_DESC, newModel.Description);
                    cmd.SetBoolean(MODEL_AVAIL_IN, newModel.IsAvailable);
                    cmd.SetString(MODEL_NAME, newModel.Name);
                });

                model = newModel.Title;

            }

            image.Model = model;

            return image;
        }

        public static readonly JsonSerializerOptions SerializationOptions = new() {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        };

        public async Task<GeneratedImage?> CreateImage(byte[] imageBytes, 
                Prompt? prompt = null, 
                int? generationDuration = null, 
                object? additionalInfo = null,
                bool? hidden = false
            ) {
            var image = await ParseImage(imageBytes);

            var img = await adoTemplate.QuerySingle(InsertSql([
                IMAGES_PROMPT, IMAGES_BASE_PROMPT, IMAGES_NEG_PROMPT, IMAGES_STEPS,
                IMAGES_SAMPLER, IMAGES_SCHEDULE_TP,IMAGES_CFG_SCL,IMAGE_ADDTL_INFO, IMAGE_HIDDEN,
                IMAGES_SEED, IMAGES_HEIGHT, IMAGES_WIDTH, IMAGES_BYTES,MODEL_TITLE, IMAGE_GEN_MS
            ], IMAGES_TABLE.Split(" ")[0], string.Join(", ", ImageColumns)), (cmd) => {
                cmd.SetString(IMAGES_PROMPT, image.Prompt);
                cmd.SetString(IMAGES_BASE_PROMPT, prompt?.PositivePrompt ?? "");
                cmd.SetString(IMAGES_NEG_PROMPT, image.NegativePrompt);
                cmd.SetInt(IMAGES_STEPS, image.Steps);
                cmd.SetString(IMAGES_SAMPLER, image.Sampler);
                cmd.SetString(IMAGES_SCHEDULE_TP, image.ScheduleType);
                cmd.SetDouble(IMAGES_CFG_SCL, image.CFGScale);
                cmd.SetLong(IMAGES_SEED, image.Seed);
                cmd.SetInt(IMAGES_HEIGHT, image.Height);
                cmd.SetInt(IMAGES_WIDTH, image.Width);
                cmd.SetBytea(IMAGES_BYTES, imageBytes);
                cmd.SetString(MODEL_TITLE, image.Model);
                cmd.SetInt(IMAGE_GEN_MS, generationDuration);
                cmd.SetBoolean(IMAGE_HIDDEN, hidden);
                if(additionalInfo!=null) cmd.SetValue(IMAGE_ADDTL_INFO, NpgsqlTypes.NpgsqlDbType.Jsonb , JsonSerializer.Serialize(additionalInfo,SerializationOptions));
            }, ImageRM) ?? throw new InvalidOperationException("This should never happen");
            
            await adoTemplate.ExecuteBatch(InsertSql([IMAGES_ID, LORA_ALIAS], IMAGES_LORA_MAP), (cmd, lora) => {
                cmd.SetInt(IMAGES_ID, img.Id);
                cmd.SetString(LORA_ALIAS, lora);
            }, image.Loras);

            img.Loras = image.Loras;

            var addToAlbum = prompt?.OrderData?.Albums ?? [];

            if (addToAlbum.Count > 0) {
                try {
                    await AddImageToAlbums(img.Id, addToAlbum);
                }
                catch (Exception e) {
                    Console.WriteLine(e.ToString());
                }
            }

            try {
                var albums = (await GetMatchingAlbums(img.Prompt)).Except(addToAlbum).ToList();
                await AddImageToAlbums(img.Id, albums);
                img.Albums = [.. albums.Union(addToAlbum)];
            }
            catch (Exception e) {
                Console.WriteLine(e.ToString());
            }

            return img;
        }

        public async Task<Album> CreateAlbum(Album album, bool addExisting) {

            string original = album.SearchQuery;
            album.SearchQuery = !TsQueryDetectRegex().IsMatch(album.SearchQuery)
                ? string.IsNullOrWhiteSpace(album.SearchQuery)
                    ? ""
                    : '(' + string.Join("<->", album.SearchQuery.Split(" ", StringSplitOptions.RemoveEmptyEntries)) + ')'
                : InQuotesRegex()
                        .Replace(album.SearchQuery, m => "(" + string.Join(" <-> ", m.Groups[1].Value.Split(' ', StringSplitOptions.RemoveEmptyEntries)) + ")"
                    );

            if (!(await ValidateTsQuery(album.SearchQuery))) {
                throw new ValidationException("Invalid TsQuery","search");
            };

            //Create the album
            var id = await adoTemplate.QuerySingle(
                    InsertSql([ALBUM_NAME, ALBUM_THUMB, ALBUM_QUERY, ALBUM_HIDDEN_IN], ALBUM_TABLE) +
                    " RETURNING " + string.Join(", ", [ALBUM_ID]), (cmd) => {
                        cmd.SetString(ALBUM_NAME, album.Name);
                        cmd.SetInt(ALBUM_THUMB, album.ThumbId);
                        cmd.SetString(ALBUM_QUERY, album.SearchQuery);
                        cmd.SetBoolean(ALBUM_HIDDEN_IN, album.HideFromTimeline);
                    }
                , reader => reader.GetInt(0));

            //If we have a search query, add everything to the search query
            if (addExisting) {
                await AddImagesToAlbum([.. (await GetAll(new() { Query = original }, -1, true)).Select(a => a.Id)], id);
            }

            //Get the album again 
            return await GetAlbum(id) ?? throw new InvalidOperationException("Waos this shouldn't happen");

        }

        #endregion

        #region READ

        public static List<WhereCondition> ConditionsFromFilter(FilterOptions filter, int? lastImage) {
            var conditions = new List<WhereCondition>();

            if (!string.IsNullOrEmpty(filter.Query)) {

                if (TsQueryDetectRegex().IsMatch(filter.Query)) {
                    conditions.Add(new WhereConditionSubgroup(new(WhereConditionUnion.OR, [
                        new FtsCondition(IMAGES_PROMPT_FTS),
                        new FtsCondition(IMAGES_BASE_PROMPT_FTS),
                        new FtsCondition(IMAGES_NOTES_FTS),
                    ])));
                }
                else {
                    conditions.Add(new WhereConditionSubgroup(new(WhereConditionUnion.OR, [
                        new(IMAGES_PROMPT, WhereConditionOperator.ILIKE),
                        new(IMAGES_BASE_PROMPT, WhereConditionOperator.ILIKE),
                        new(IMAGES_NOTES, WhereConditionOperator.ILIKE),
                    ])));
                }
            }

            if (!string.IsNullOrEmpty(filter.Model)) {
                conditions.Add(new(MODEL_TITLE));
            }

            if (filter.Favorite == true) {
                conditions.Add(new(IMAGES_FAV_IN, WhereConditionOperator.EQUALS, "true"));
            }

            if (filter.Upscaled == true) {
                conditions.Add(new(IMAGES_HIRES_IN, WhereConditionOperator.EQUALS, "true"));
            }

            if (filter.Downloaded == true) {
                conditions.Add(new(IMAGES_DOWNLOAD_CT, WhereConditionOperator.GREATER_THAN, "0"));
            }

            if (filter.Grid != null && filter.Grid >= 0) {
                conditions.Add(new("(" + IMAGE_ADDTL_INFO + "->> 'gridId')::Int", WhereConditionOperator.EQUALS, "@" + GRID_ID));
            }

            if (!string.IsNullOrEmpty(filter.Lora)) {
                conditions.Add(new(
                    "img." + IMAGES_ID, WhereConditionOperator.IN, "(" + SelectSql([IMAGES_ID], IMAGES_LORA_MAP, new WhereConditionGroup([new(LORA_ALIAS)])) + ")"
                ));
            }

            if (filter.Album != null && filter.Album >= 0) {
                conditions.Add(new(
                    "img." + IMAGES_ID, WhereConditionOperator.IN, "(" + SelectSql([IMAGES_ID], ALBUM_MAP, new WhereConditionGroup([new(ALBUM_ID)])) + ")"
                ));
            }
            else {
                conditions.Add(new(
                    "img." + IMAGES_ID, WhereConditionOperator.NOT_IN, "(" + SelectSql([IMAGES_ID], $"{ALBUM_MAP} am left join {ALBUM_TABLE} at on am.{ALBUM_ID} = at.{ALBUM_ID} ", new WhereConditionGroup([new(ALBUM_HIDDEN_IN, WhereConditionOperator.EQUALS, "true")])) + ")"
                ));
            }

            if (!string.IsNullOrEmpty(filter.FromDate)) {
                conditions.Add(new(CRE_TS, WhereConditionOperator.GREATER_THAN, "@FROM_DATE"));
            }

            if (!string.IsNullOrEmpty(filter.ToDate)) {
                conditions.Add(new(CRE_TS, WhereConditionOperator.LESS_THAN, "@TO_DATE"));
            }

            if (lastImage != null && lastImage > 0) {
                conditions.Add(new(IMAGES_ID, WhereConditionOperator.LESS_THAN, lastImage + ""));
            }


            if (
                //We have no Album
                (filter.Album == null || filter.Album < 0) &&
                //We have no Grid
                (filter.Grid==null || filter.Grid < 0)
            ) {
                conditions.Add(
                    new WhereConditionSubgroup(new(WhereConditionUnion.OR,[
                        new(IMAGE_HIDDEN,WhereConditionOperator.EQUALS,"false"),
                        new(IMAGES_FAV_IN,WhereConditionOperator.EQUALS,"true")
                    ]))
                );
            }

            return conditions;
        }

        public static void SetterFromFilter(Setter cmd, FilterOptions filter) {
            if (!string.IsNullOrEmpty(filter.Query)) {

                if (TsQueryDetectRegex().IsMatch(filter.Query)) {
                    var tsQuery = InQuotesRegex()
                        .Replace(filter.Query, m => "(" + string.Join(" <-> ", m.Groups[1].Value.Split(' ', StringSplitOptions.RemoveEmptyEntries)) + ")"
                    );

                    cmd.SetString(IMAGES_PROMPT_FTS, tsQuery);
                    cmd.SetString(IMAGES_BASE_PROMPT_FTS, tsQuery);
                    cmd.SetString(IMAGES_NOTES_FTS, tsQuery);
                }
                else {
                    cmd.SetString(IMAGES_PROMPT, $"%{filter.Query}%");
                    cmd.SetString(IMAGES_BASE_PROMPT, $"%{filter.Query}%");
                    cmd.SetString(IMAGES_NOTES, $"%{filter.Query}%");
                }

            }

            if (!string.IsNullOrEmpty(filter.Model)) { cmd.SetString(MODEL_TITLE, filter.Model); }
            if (!string.IsNullOrEmpty(filter.Lora)) { cmd.SetString(LORA_ALIAS, filter.Lora); }
            if (filter.Album != null && filter.Album >= 0) { cmd.SetInt(ALBUM_ID, filter.Album); }
            if (filter.Grid != null && filter.Grid >= 0) {cmd.SetInt(GRID_ID,filter.Grid);}


            if (!string.IsNullOrEmpty(filter.FromDate)) {
                cmd.SetDate("FROM_DATE", DateTime.Parse(filter.FromDate));
            }

            if (!string.IsNullOrEmpty(filter.ToDate)) {
                cmd.SetDate("TO_DATE", DateTime.Parse(filter.ToDate));
            }
        }

        private const int PAGE_SIZE = 54;

        public async Task<List<GeneratedImage>> GetAll(FilterOptions filter, int lastImage, bool disablePagination = false) {
            return await adoTemplate.Query(
                SelectSql(ImageColumns,IMAGES_TABLE,
                    new WhereConditionGroup(ConditionsFromFilter(filter, lastImage)),
                    [new OrderBy(CRE_TS, SortOrder.DESC)],
                    disablePagination ? -1 : PAGE_SIZE, 0
                ),
                (cmd) => SetterFromFilter(cmd, filter), ImageRM
            );
        }

        public async Task<int> GetAllCount(FilterOptions filter) {
            return await adoTemplate.QuerySingle(SelectSql(["count(*)"], IMAGES_TABLE, new WhereConditionGroup(ConditionsFromFilter(filter, null))),
                    (cmd) => SetterFromFilter(cmd, filter), (reader) => reader.GetInt(0)
                );
        }

        public async Task<GeneratedImage?> Get(int id) {
            return await adoTemplate.QuerySingle(
                SelectSql(ImageColumns, IMAGES_TABLE,
                    new WhereConditionGroup([new(IMAGES_ID)])
                ),
                (cmd) => cmd.SetInt(IMAGES_ID, id), ImageRM
            );
        }

        public async Task<ImageDownload?> GetImage(int id, bool countDownload = false) {

            var sql = SelectSql(
                columns: [IMAGES_BYTES],
                table: IMAGES_TABLE,
                new WhereConditionGroup([
                    new(IMAGES_ID),
                ])
            );

            if (countDownload) await IncrementDownloadCount(id);

            return await adoTemplate.QuerySingle(sql, 
                (cmd) => cmd.SetInt(IMAGES_ID, id), 
                (reader) => new ImageDownload() {
                Filename = id + "",
                Mime = "image/png",
                Data = reader.GetOptionalBytea(IMAGES_BYTES),
            });
        }

        public async Task<ImageDownload?> GetHiResImage(int id, bool countDownload = false) {

            var sql = SelectSql(
                columns: [IMAGES_HIRES_BYTES],
                table: IMAGES_TABLE,
                new WhereConditionGroup([
                    new(IMAGES_ID),
                ])
            );

            if (countDownload) await IncrementDownloadCount(id);

            return await adoTemplate.QuerySingle(sql, 
                (cmd) => cmd.SetInt(IMAGES_ID, id), 
                (reader) => new ImageDownload() {
                Filename = id + "",
                Mime = "image/png",
                Data = reader.GetOptionalBytea(IMAGES_HIRES_BYTES),
            });
        }

        public async Task<ImageDownload?> GetImageOptionalHires(int id, bool countDownload = false) {

            var sql = $@"
                select 
                    case 
                        when {IMAGES_HIRES_IN} 
                        then {IMAGES_HIRES_BYTES}
                        else {IMAGES_BYTES}
                    end as {IMAGES_BYTES}
                from {IMAGES_TABLE}
                where {IMAGES_ID} = @{IMAGES_ID}
            ";

            if (countDownload) await IncrementDownloadCount(id);

            return await adoTemplate.QuerySingle(sql, 
                (cmd) => cmd.SetInt(IMAGES_ID, id), 
                (reader) => new ImageDownload() {
                Filename = id + "",
                Mime = "image/png",
                Data = reader.GetOptionalBytea(IMAGES_BYTES),
            });

        }

        public async Task IncrementDownloadCount(int id) {
            var sql = $@"
                update {IMAGES_TABLE}
                set {IMAGES_DOWNLOAD_CT} = {IMAGES_DOWNLOAD_CT} + 1
                where {IMAGES_ID} = @{IMAGES_ID}
            ";

            await adoTemplate.Execute(sql, (cmd) => cmd.SetInt(IMAGES_ID, id));

        }

        public async Task<List<Album>> GetAlbums() {
            return await adoTemplate.Query(SelectSql(
                    [ALBUM_ID, ALBUM_COUNT, ALBUM_NAME, ALBUM_QUERY, ALBUM_THUMB, ALBUM_SAMPLE_IDS, MAX_TS, MIN_TS, ALBUM_HIDDEN_IN],
                    ALBUM_META_VIEW, new WhereConditionGroup([]), [new OrderBy(ALBUM_NAME)]
                ), (cmd) => { }, AlbumMetaRM);
        }

        public async Task<Album?> GetAlbum(int album) {
            return await adoTemplate.QuerySingle(SelectSql(
                    [ALBUM_ID, ALBUM_COUNT, ALBUM_NAME, ALBUM_QUERY, ALBUM_THUMB, ALBUM_SAMPLE_IDS, MAX_TS, MIN_TS, ALBUM_HIDDEN_IN],
                    ALBUM_META_VIEW, new WhereConditionGroup([new(ALBUM_ID)])
                ), (cmd) => cmd.SetInt(ALBUM_ID, album), AlbumMetaRM);
        }

        private async Task<Album?> GetAlbumSimple(int album) {
            return await adoTemplate.QuerySingle(SelectSql(
                    [ALBUM_ID, ALBUM_NAME, ALBUM_QUERY, ALBUM_THUMB, ALBUM_HIDDEN_IN],
                    ALBUM_TABLE, new WhereConditionGroup([new(ALBUM_ID)])
                ), (cmd) => cmd.SetInt(ALBUM_ID, album), AlbumRM);
        }

        private async Task<List<int>> GetMatchingAlbums(string prompt) {
            return await adoTemplate.Query(SelectSql(
                    [ALBUM_ID, ALBUM_NAME, ALBUM_QUERY, ALBUM_THUMB],
                    ALBUM_TABLE, new WhereConditionGroup([
                        new WhereCondition($"length({ALBUM_QUERY})", WhereConditionOperator.GREATER_THAN,"0"),
                        new WhereConditionSubgroup(
                            new WhereConditionGroup(WhereConditionUnion.OR,[
                                new InverseFtsCondition(ALBUM_QUERY, IMAGES_PROMPT),
                                new InverseFtsCondition(ALBUM_QUERY, IMAGES_BASE_PROMPT)
                            ])
                        )]), [new OrderBy(ALBUM_NAME)]), (cmd) => {
                            cmd.SetString(IMAGES_PROMPT, prompt);
                            cmd.SetString(IMAGES_BASE_PROMPT, prompt);
                        }, reader => reader.GetInt(ALBUM_ID));
        }

        public async Task<List<Album>> GetImageAlbums(int image) {
            return await adoTemplate.Query(
                SelectSql(
                    ["map." + ALBUM_ID, ALBUM_COUNT, ALBUM_NAME, ALBUM_QUERY, ALBUM_THUMB, ALBUM_SAMPLE_IDS, MAX_TS, MIN_TS, ALBUM_HIDDEN_IN]
                    , $"{ALBUM_MAP} map, {ALBUM_META_VIEW} inf", new WhereConditionGroup([new(IMAGES_ID), new JoinCondition("map", "inf", ALBUM_ID)])
                    , [new OrderBy(ALBUM_NAME)]
                ), (cmd) => cmd.SetInt(IMAGES_ID, image), AlbumMetaRM);
        }

        private async Task<bool> ValidateTsQuery(string query) {
            if (string.IsNullOrWhiteSpace(query)) return true;

            var sql = "SELECT to_tsquery('english', @query);";
            try {
                await adoTemplate.Execute(sql, (cmd) => cmd.SetString("query", query));
                return true;
            }
            catch (Exception e) {
                Console.WriteLine(e);
                return false;
            }
        }

        public async Task<List<KeywordUsage>> GetKeywordUsage(FilterOptions filter, int limit) {
            var sql = $@"
                SELECT
                  k.keyword as {KEYWORD},
                  COUNT(*) AS {KEYWORD_USAGE},
                  MIN(k.{IMAGES_ID}) AS {KEYWORD_SAMPLE},
                  min(k.{CRE_TS}) as {MIN_TS}, max(k.{CRE_TS}) as {MAX_TS}
                FROM (
                  {SelectSql([IMAGES_ID,IMAGES_PROMPT, CRE_TS],IMAGES_TABLE,
                    new WhereConditionGroup(ConditionsFromFilter(filter, null)), [new(CRE_TS,SortOrder.DESC)])}
                  {(limit > 0 ? $" LIMIT {limit}" : "")}
                ) AS filtered_images
                JOIN LATERAL extract_keywords(filtered_images.{IMAGES_ID}, filtered_images.{IMAGES_PROMPT},filtered_images.{CRE_TS}) AS k ON TRUE
                GROUP BY k.keyword
                ORDER BY {KEYWORD_USAGE} DESC, k.keyword;
            ";

            return await adoTemplate.Query(sql, (cmd) => {
                SetterFromFilter(cmd, filter);
            }, reader => new KeywordUsage() {
                Keyword = reader.GetString(KEYWORD),
                Count = reader.GetInt(KEYWORD_USAGE),
                Sample = reader.GetInt(KEYWORD_SAMPLE),
                MinTs = reader.GetDateTime(MIN_TS),
                MaxTs = reader.GetDateTime(MAX_TS)
            });
        }

        public async Task<List<KeywordUsageDated>> GetKeywordDatedUsage(FilterOptions filter, int limit, string keyword) {
            var sql = $@"
                select 
                    DATE(cre_ts) as {KEYWORD_USAGE_DATE}, 
                    count(*) as {KEYWORD_USAGE}, 
                    min(image_id) as {KEYWORD_SAMPLE}
                from (
                    SELECT
                      k.keyword,
                      k.{CRE_TS},
                      k.{IMAGES_ID}
                    FROM (
                        {SelectSql([IMAGES_ID, IMAGES_PROMPT, CRE_TS], IMAGES_TABLE,
                        new WhereConditionGroup(ConditionsFromFilter(filter, null)), [new(CRE_TS, SortOrder.DESC)])}
                        {(limit > 0 ? $" LIMIT {limit}" : "")}
                    ) AS filtered_images
                    JOIN LATERAL extract_keywords(filtered_images.{IMAGES_ID}, filtered_images.{IMAGES_PROMPT},filtered_images.{CRE_TS}) AS k ON TRUE
                    WHERE LOWER(k.keyword) = @{KEYWORD}
                ) group by {KEYWORD_USAGE_DATE} order by {KEYWORD_USAGE_DATE} asc
            ";

            return await adoTemplate.Query(sql, (cmd) => {
                SetterFromFilter(cmd, filter);
                cmd.SetString(KEYWORD, keyword.ToLowerInvariant());
            }, reader => new KeywordUsageDated() {
                Keyword = keyword,
                Count = reader.GetInt(KEYWORD_USAGE),
                Sample = reader.GetInt(KEYWORD_SAMPLE),
                Date = reader.GetDateTime(KEYWORD_USAGE_DATE),
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

            img.Favorite = fav;

            return img;
        }

        public async Task<GeneratedImage?> UpdateNotes(int id, string notes) {
            var img = await Get(id);
            if (img == null) return null;

            await adoTemplate.Execute(UpdateSql([IMAGES_NOTES], IMAGES_TABLE, new([new(IMAGES_ID)])), (cmd) => {
                cmd.SetString(IMAGES_NOTES, notes);
                cmd.SetInt(IMAGES_ID, id);
            });

            img.Notes = notes;

            return img;
        }

        public async Task<GeneratedImage?> SaveHiResImage(int id, byte[] image, int scale) {
            return await adoTemplate.QuerySingle(
                UpdateSql([IMAGES_HIRES_BYTES], IMAGES_TABLE, new([new(IMAGES_ID)])) +
                " RETURNING " + string.Join(", ", ImageColumns)
            , (cmd) => {
                cmd.SetBytea(IMAGES_HIRES_BYTES, image);
                cmd.SetInt(IMAGES_ID, id);
            }, ImageRM);
        }

        public async Task<Album> UpdateAlbum(Album album) {
            //Find the album
            var existingAlbum = await GetAlbumSimple(album.Id ?? 0) ?? throw new InvalidOperationException("Album not found!");

            album.SearchQuery = !TsQueryDetectRegex().IsMatch(album.SearchQuery)
                ? string.IsNullOrWhiteSpace(album.SearchQuery)
                    ? ""
                    : '(' + string.Join("<->", album.SearchQuery.Split(" ", StringSplitOptions.RemoveEmptyEntries)) + ')'
                : InQuotesRegex()
                    .Replace(album.SearchQuery, m => "(" + string.Join(" <-> ", m.Groups[1].Value.Split(' ', StringSplitOptions.RemoveEmptyEntries)) + ")"
            );

            if (!(await ValidateTsQuery(album.SearchQuery))) {
                throw new ValidationException("Invalid TsQuery", "search");
            };
            
            existingAlbum.SearchQuery = album.SearchQuery;
            existingAlbum.ThumbId = album.ThumbId;
            existingAlbum.Name = album.Name;
            existingAlbum.HideFromTimeline = album.HideFromTimeline;

            await adoTemplate.Execute(UpdateSql(
                [ALBUM_QUERY, ALBUM_THUMB, ALBUM_NAME, ALBUM_HIDDEN_IN],
                ALBUM_TABLE, new WhereConditionGroup([new(ALBUM_ID)])
                ), (cmd) => {
                    cmd.SetInt(ALBUM_ID, album.Id);
                    cmd.SetString(ALBUM_NAME, album.Name);
                    cmd.SetInt(ALBUM_THUMB, album.ThumbId);
                    cmd.SetString(ALBUM_QUERY, album.SearchQuery);
                    cmd.SetBoolean(ALBUM_HIDDEN_IN, album.HideFromTimeline);
                });

            return existingAlbum;

        }

        public async Task AddImageToAlbum(int image, int album) {
            if (await ImageAlreadyInAlbum(image, album)) {
                return;
            }

            await adoTemplate.Execute(InsertSql([ALBUM_ID, IMAGES_ID], ALBUM_MAP), (cmd) => {
                cmd.SetInt(ALBUM_ID, album);
                cmd.SetInt(IMAGES_ID, image);
            });

        }

        public async Task AddImagesToAlbum(List<int> images, int album) {
            await adoTemplate.ExecuteBatch(InsertSql([ALBUM_ID, IMAGES_ID], ALBUM_MAP), (cmd, image) => {
                cmd.SetInt(ALBUM_ID, album);
                cmd.SetInt(IMAGES_ID, image);
            }, images);

        }

        public async Task AddImageToAlbums(int image, List<int> albums) {
            await adoTemplate.ExecuteBatch(InsertSql([ALBUM_ID, IMAGES_ID], ALBUM_MAP), (cmd, album) => {
                cmd.SetInt(ALBUM_ID, album);
                cmd.SetInt(IMAGES_ID, image);
            }, albums);

        }

        public async Task RemoveImageFromAlbum(int image, int album) {
            await adoTemplate.Execute(DeleteSql(ALBUM_MAP, new WhereConditionGroup([new(ALBUM_ID), new(IMAGES_ID)])), (cmd) => {
                cmd.SetInt(ALBUM_ID, album);
                cmd.SetInt(IMAGES_ID, image);
            });
        }



        private async Task<bool> ImageAlreadyInAlbum(int image, int album) {
            return await adoTemplate.QuerySingle(
                    SelectSql(["count(*)"], ALBUM_MAP,
                    new WhereConditionGroup([new(ALBUM_ID), new(IMAGES_ID)])),
                    (cmd) => {
                        cmd.SetInt(ALBUM_ID, album);
                        cmd.SetInt(IMAGES_ID, image);
                    },
                    (reader) => reader.GetInt(0) > 0
                );
        }

        #endregion

        #region DELETE

        public async Task DeleteImage(int id) {
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

        public async Task DeleteAlbum(int album) {
            await adoTemplate.Execute(DeleteSql(ALBUM_TABLE, new([new(ALBUM_ID)])), cmd => cmd.SetInt(ALBUM_ID, album));
        }

        #endregion

        #region REGEX

        [GeneratedRegex(@"<lora:([^>:]+):([\d.]+)>")]
        public static partial Regex LoraRegex();
        [GeneratedRegex("\"([^\"]+)\"")]
        public static partial Regex InQuotesRegex();

        [GeneratedRegex(@"[&|!:<]")]
        public static partial Regex TsQueryDetectRegex();

        #endregion

    }
}
