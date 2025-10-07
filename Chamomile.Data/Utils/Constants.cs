namespace Chamomile.Data.Utils {
    public static class Constants {

        public static readonly string SCHEMA = "chamomile";

        public static readonly string MODELS_TABLE = $"{SCHEMA}.models";

        public static readonly string MODEL_TITLE        = "model_title_tx";
        public static readonly string MODEL_NAME         = "model_nm";
        public static readonly string MODEL_DESC         = "model_desc_tx";
        public static readonly string MODEL_AVAIL_IN     = "model_avail_in";
        public static readonly string MODEL_TYPE_CD      = "model_type_cd";
        public static readonly string MODEL_TAG          = "model_tag_tx";

        public static readonly string LORA_TABLE         = $"{SCHEMA}.lora";
        public static readonly string LORA_NAME          = "lora_nm";
        public static readonly string LORA_ALIAS         = "lora_alias_tx";
        public static readonly string LORA_DESC          = "lora_desc_tx";
        public static readonly string LORA_SAMPLE_PROMPT = "lora_sample_prompt_tx";
        public static readonly string LORA_AVAIL_IN      = "lora_avail_in";
        public static readonly string LORA_TYPE_CD       = "lora_type_cd";
        public static readonly string LORA_TAG           = "lora_tag_tx";

        public static readonly string IMAGES_TABLE       = $"{SCHEMA}.images img";
        public static readonly string IMAGES_ID          = "image_id";
        public static readonly string IMAGES_PROMPT      = "image_prompt_tx";
        public static readonly string IMAGES_BASE_PROMPT = "image_base_prompt_tx";
        public static readonly string IMAGES_NOTES       = "image_notes_tx";
        public static readonly string IMAGES_NEG_PROMPT  = "image_neg_prompt_tx";
        public static readonly string IMAGES_STEPS       = "image_step_cnt";
        public static readonly string IMAGES_SAMPLER     = "image_sampler_tx";
        public static readonly string IMAGES_SCHEDULE_TP = "image_schedule_tp";
        public static readonly string IMAGES_CFG_SCL     = "image_cfg_scl_num";
        public static readonly string IMAGES_SEED        = "image_seed_num";
        public static readonly string IMAGES_HEIGHT      = "image_hght_num";
        public static readonly string IMAGES_WIDTH       = "image_wdth_num";
        public static readonly string IMAGES_FAV_IN      = "image_fav_in";
        public static readonly string IMAGES_BYTES       = "image_bytes_tx";
        public static readonly string IMAGES_HIRES_IN    = "image_hires_in";
        public static readonly string IMAGES_HIRES_BYTES = "image_hires_bytes_tx";
        public static readonly string IMAGES_PROMPT_FTS  = "image_prompt_fts";
        public static readonly string IMAGES_BASE_PROMPT_FTS = "image_base_prompt_fts";
        public static readonly string IMAGES_NOTES_FTS   = "image_notes_fts";
        public static readonly string IMAGE_GEN_MS       = "image_gen_ms_nb";
        public static readonly string IMAGES_DOWNLOAD_CT = "image_download_ct"; 
        public static readonly string IMAGE_SIZE         = "image_effective_size_nb";
        public static readonly string IMAGE_HIDDEN       = "image_hidden_in";
        public static readonly string IMAGE_ADDTL_INFO   = "img_addtl_info_mv";
        public static readonly string IMAGE_PROMPTS_HASH = "image_prompts_hash";
        public static readonly string IMAGE_BASE_PROMPT_HASH = "image_base_prompt_hash";


        //This is a virtual column in a JSONB column but I don't care
        public static readonly string IMAGE_SAMPLE_ID    = "img_sample_id";

        public static readonly string IMAGES_LORA_MAP = $"{SCHEMA}.images_lora_map";

        public static readonly string PROMPT_TABLE       = $"{SCHEMA}.prompts";
        public static readonly string PROMPT_ID          = "prompt_id";
        public static readonly string PROMPT_NAME        = "prompt_nm";
        public static readonly string PROMPT_PROMPT      = "prompt_prompt_tx";
        public static readonly string PROMPT_NEG_PROMPT  = "prompt_neg_prompt_tx";
        public static readonly string PROMPT_STEPS       = "prompt_step_cnt";
        public static readonly string PROMPT_SAMPLER     = "prompt_sampler_tx";
        public static readonly string PROMPT_SCHEDULE_TP = "prompt_schedule_tp";
        public static readonly string PROMPT_CFG_SCL     = "prompt_cfg_scl_num";
        public static readonly string PROMPT_HEIGHT      = "prompt_hght_num";
        public static readonly string PROMPT_WIDTH       = "prompt_wdth_num";

        public static readonly string MODEL_USAGE_COUNT = "model_usage_count";
        public static readonly string LORA_USAGE_COUNT = "lora_usage_count";

        public static readonly string ALBUM_TABLE = $"{SCHEMA}.albums";
        public static readonly string ALBUM_META_VIEW = $"{SCHEMA}.album_meta";
        public static readonly string ALBUM_ID = "album_id";
        public static readonly string ALBUM_NAME = "album_nm";
        public static readonly string ALBUM_COUNT = "album_image_ct";
        public static readonly string ALBUM_THUMB = "album_thumb_id";
        public static readonly string ALBUM_SAMPLE_IDS = "album_sample_ids";
        public static readonly string ALBUM_QUERY = "album_query_tx";
        public static readonly string ALBUM_HIDDEN_IN = "album_hidden_in";


        public static readonly string ALBUM_MAP = $"{SCHEMA}.album_map";

        public static readonly string GRID_TABLE = $"{SCHEMA}.grids";
        public static readonly string GRID_ID = "grid_id";
        public static readonly string GRID_NM = "grid_nm";
        public static readonly string GRID_PROMPT_TX = "grid_prompt_tx";
        public static readonly string GRID_NOTES_TX = "grid_notes_tx";
        public static readonly string GRID_NEGATIVE_PROMPT_TX = "grid_negative_prompt_tx";
        public static readonly string GRID_STEP_CNT = "grid_step_cnt";
        public static readonly string GRID_SAMPLER_TX = "grid_sampler_tx";
        public static readonly string GRID_SCHEDULE_TP = "grid_schedule_tp";
        public static readonly string GRID_CFG_SCL_NUM = "grid_cfg_scl_num";
        public static readonly string GRID_SEED_NUM = "grid_seed_num";
        public static readonly string GRID_HGHT_NUM = "grid_hght_num";
        public static readonly string GRID_WDTH_NUM = "grid_wdth_num";
        public static readonly string GRID_GENERATION_DURATION_MS = "grid_generation_duration_ms";
        public static readonly string GRID_XVAL_CD = "grid_xval_cd";
        public static readonly string GRID_XVAL = "grid_xval";
        public static readonly string GRID_YVAL_CD = "grid_yval_cd";
        public static readonly string GRID_YVAL = "grid_yval";

        public static readonly string CRE_TS = "cre_ts";
        public static readonly string MIN_TS = "min_ts";
        public static readonly string MAX_TS = "max_ts";

        public static readonly string KEYWORD = "keyword_tx";
        public static readonly string KEYWORD_USAGE = "usage_ct";
        public static readonly string KEYWORD_USAGE_DATE = "usage_dt";
        public static readonly string KEYWORD_SAMPLE = "sample_id";

    }
}
