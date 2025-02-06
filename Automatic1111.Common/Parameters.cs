namespace Automatic1111.Common {
    /// <summary>
    /// Represents the parameters for generating an image in the Automatic1111 API.
    /// </summary>
    public class Parameters {

        /// <summary>Prompt of the image.</summary>
        public string prompt { get; set; } = "";

        /// <summary>Negative prompt to exclude certain elements from the image.</summary>
        public string negative_prompt { get; set; } = "";

        /// <summary>Styles from A1111 to apply to the generated image.</summary>
        public List<string>? styles { get; set; } = [];

        /// <summary>Seed used for image generation (-1 for random).</summary>
        public long seed { get; set; } = -1;

        /// <summary>Subseed used for variation in image generation (-1 for random).</summary>
        public long subseed { get; set; } = -1;

        /// <summary>Influence of the subseed on the generated image.</summary>
        public double subseed_strength { get; set; } = 0;

        /// <summary>Resizes the seed image height (-1 to disable).</summary>
        public int seed_resize_from_h { get; set; } = -1;

        /// <summary>Resizes the seed image width (-1 to disable).</summary>
        public int seed_resize_from_w { get; set; } = -1;

        /// <summary>Sampler algorithm used for image generation.</summary>
        public string? sampler_name { get; set; } = "";

        /// <summary>Scheduler type used for denoising.</summary>
        public string? scheduler { get; set; } = "";

        /// <summary>Number of images to generate per batch.</summary>
        public int batch_size { get; set; } = 1;

        /// <summary>Number of batches to generate.</summary>
        public int n_iter { get; set; } = 1;

        /// <summary>Number of steps for the diffusion process.</summary>
        public int steps { get; set; } = 30;

        /// <summary>CFG (Classifier-Free Guidance) scale factor.</summary>
        public double cfg_scale { get; set; } = 7;

        /// <summary>Width of the output image.</summary>
        public int width { get; set; } = 1024;

        /// <summary>Height of the output image.</summary>
        public int height { get; set; } = 1024;

        /// <summary>Enable face restoration (e.g., GFPGAN).</summary>
        public bool restore_faces { get; set; } = false;

        /// <summary>Enable tiling to generate seamless textures.</summary>
        public bool tiling { get; set; } = false;

        /// <summary>Prevents saving individual images.</summary>
        public bool do_not_save_samples { get; set; } = false;

        /// <summary>Prevents saving the image grid.</summary>
        public bool do_not_save_grid { get; set; } = false;

        // <summary>ETA noise multiplier (used in some samplers).</summary>
        //public int eta { get; set; } = 0;

        // <summary>Strength of denoising applied to the image.</summary>
        //public int denoising_strength { get; set; } = 0;

        // <summary>Controls unconditional guidance (low values mean more random outputs).</summary>
        //public int s_min_uncond { get; set; } = 0;

        // <summary>Churn parameter for noise scheduling.</summary>
        //public int s_churn { get; set; } = 0;

        // <summary>Maximum noise threshold.</summary>
        //public int s_tmax { get; set; } = 0;

        // <summary>Minimum noise threshold.</summary>
        //public int s_tmin { get; set; } = 0;

        // <summary>Noise level for sampling.</summary>
        //public int s_noise { get; set; } = 0;

        // <summary>Overrides settings for this image generation.</summary>
        //public Dictionary<string, object>? override_settings { get; set; } = null;

        // <summary>Restores settings after override.</summary>
        //public bool override_settings_restore_afterwards { get; set; } = true;

        // <summary>Checkpoint to use for the refiner model.</summary>
        //public string refiner_checkpoint { get; set; } = "";

        // <summary>Step at which to switch to the refiner model.</summary>
        //public int refiner_switch_at { get; set; } = 0;

        // <summary>Disables additional networks (e.g., LoRA, Hypernetworks).</summary>
        //public bool disable_extra_networks { get; set; } = false;

        // <summary>Initial image used for first pass processing.</summary>
        //public string firstpass_image { get; set; } = "";

        // <summary>Additional metadata comments.</summary>
        //public Dictionary<string, object>? comments { get; set; } = null;

        /// <summary>Enable high-resolution (HR) upscaling.</summary>
        public bool enable_hr { get; set; } = false;

        /// <summary>Width for the first phase of HR upscaling.</summary>
        public int firstphase_width { get; set; } = 0;

        /// <summary>Height for the first phase of HR upscaling.</summary>
        public int firstphase_height { get; set; } = 0;

        /// <summary>Upscaling multiplier for HR.</summary>
        public double hr_scale { get; set; } = 2.0;

        /// <summary>Upscaler model used for HR.</summary>
        public string hr_upscaler { get; set; } = "";

        /// <summary>Steps for the second pass of HR processing.</summary>
        public int hr_second_pass_steps { get; set; } = 0;

        /// <summary>Resize width for HR processing.</summary>
        public int hr_resize_x { get; set; } = 0;

        /// <summary>Resize height for HR processing.</summary>
        public int hr_resize_y { get; set; } = 0;

        /// <summary>Checkpoint name used for HR processing.</summary>
        public string hr_checkpoint_name { get; set; } = "";

        /// <summary>Sampler name used for HR processing.</summary>
        public string hr_sampler_name { get; set; } = "";

        /// <summary>Scheduler used for HR processing.</summary>
        public string hr_scheduler { get; set; } = "";

        /// <summary>Alternate prompt for HR pass.</summary>
        public string hr_prompt { get; set; } = "";

        /// <summary>Alternate negative prompt for HR pass.</summary>
        public string hr_negative_prompt { get; set; } = "";

        /// <summary>Task ID to force a specific processing mode.</summary>
        public string force_task_id { get; set; } = "";

        /// <summary>Sampler algorithm index.</summary>
        public string sampler_index { get; set; } = "Euler";

        // <summary>Script to execute during processing.</summary>
        //public string script_name { get; set; } = "";

        // <summary>Arguments for the script.</summary>
        //public List<object> script_args { get; set; } = [];

        /// <summary>Whether to send images in response.</summary>
        public bool send_images { get; set; } = true;

        /// <summary>Whether to save images.</summary>
        public bool save_images { get; set; } = true;

        // <summary>Always-on scripts for customization.</summary>
        //public Dictionary<string, object>? alwayson_scripts { get; set; } = null;

        // <summary>Metadata infotext for the generated image.</summary>
        //public string? infotext { get; set; } = "";
    }
}
