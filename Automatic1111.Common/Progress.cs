namespace Automatic1111.Common {

    /// <summary>Progress of a generation</summary>
    public class Progress {

        /// <summary>Progress percentage in 0.0-1.0</summary>
        public double progress { get; set; } = 0.0;

        /// <summary>ETA relative to now in seconds</summary>
        public double eta_relative { get; set; } = 0.0;

        /// <summary>State of this generation</summary>
        public State state { get; set; }  = new State();

        /// <summary>State of an image generation</summary>
        public class State { 

            /// <summary>Indicates this generation is in the process of being skipped</summary>
            public bool skipped { get; set; }

            /// <summary>Indicates this generation is in the process of being interrupted</summary>
            public bool interrupted { get; set; }

            /// <summary>Indicates this generation is in the process of being stopped</summary>
            public bool stopping_generation { get; set; }

            /// <summary>Type of job that is currently executing</summary>
            public string job { get; set; } = "";

            /// <summary>Number of jobs executing (??)</summary>
            public int job_count { get; set; }

            /// <summary>When this job was started</summary>
            public string job_timestamp { get; set; } = "";

            /// <summary>Number of this job (??)</summary>
            public int job_no { get; set; }

            /// <summary>Current sampling step</summary>
            public int sampling_step { get; set; }

            /// <summary>Total sampling steps</summary>
            public int sampling_steps { get; set; }
        }

        /// <summary>Preview of the image in its current state of generation in Base64</summary>
        public string current_image { get; set; } = "";
    }
}
