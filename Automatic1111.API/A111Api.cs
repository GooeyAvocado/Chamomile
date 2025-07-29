using Automatic1111.Common;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Automatic1111.API {

    /// <summary>API for A1111 operations</summary>
    public class A111Api(string api) {
        private const string SD_MODEL_CHECKPOINT = "sd_model_checkpoint";
        private static readonly JsonSerializerOptions DESERIALIZER_OPTIONS = new() { 
            PropertyNameCaseInsensitive = true,
            NumberHandling = JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.AllowNamedFloatingPointLiterals
        };
        
        private static readonly JsonSerializerOptions IMAGE_DESERIALIZER_OPTIONS = new() {
            PropertyNameCaseInsensitive = true, // Case-insensitive matching
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull, // Prevents null clutter
            ReadCommentHandling = JsonCommentHandling.Skip // Skips unexpected JSON comments
        };

        private static readonly JsonSerializerOptions PROMPT_SERIALZIER_OPTIONS = new() {
            PropertyNamingPolicy = null,  // Matches API field names+
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull // Avoids sending `null`
        };
        public async Task<bool> Ping() {
            var client = new HttpClient();
            try {
                var response = await client.GetAsync(api + "/sdapi/v1/options");
                return response.IsSuccessStatusCode;
            }
            catch (Exception) {
                return false;
            }
        }

        public async Task<List<Model>> GetModels() {
            var client = new HttpClient();
            var response = await client.GetStringAsync(api + "/sdapi/v1/sd-models");

            return JsonSerializer.Deserialize<List<Model>>(response, DESERIALIZER_OPTIONS) ?? throw new InvalidOperationException("No models found");
        }

        public async Task<List<Lora>> GetLoras() {
            var client = new HttpClient();
            var response = await client.GetStringAsync(api + "/sdapi/v1/loras");

            return JsonSerializer.Deserialize<List<Lora>>(response, DESERIALIZER_OPTIONS) ?? throw new InvalidOperationException("No Loras found");
        }

        public async Task<List<Scheduler>> GetSchedulers() {
            var client = new HttpClient();
            var response = await client.GetStringAsync(api + "/sdapi/v1/schedulers");

            return JsonSerializer.Deserialize<List<Scheduler>>(response, DESERIALIZER_OPTIONS) ?? throw new InvalidOperationException("No Loras found");
        }

        public async Task<List<Sampler>> GetSamplers() {
            var client = new HttpClient();
            var response = await client.GetStringAsync(api + "/sdapi/v1/samplers");

            return JsonSerializer.Deserialize<List<Sampler>>(response, DESERIALIZER_OPTIONS) ?? throw new InvalidOperationException("No Loras found");
        }

        public async Task<Progress> GetProgress() {
            var client = new HttpClient();
            var response = await client.GetStringAsync(api + "/sdapi/v1/progress");

            return JsonSerializer.Deserialize<Progress>(response, DESERIALIZER_OPTIONS) ?? throw new InvalidOperationException("Could not get progress");
        }

        public async Task<Txt2ImgResponse?> GenerateImage(Parameters parameters) {
            string apiUrl = api + "/sdapi/v1/txt2img";
            using var client = new HttpClient() { 
                Timeout = TimeSpan.FromMinutes(10)
            };

            
            // Step 2: Serialize parameters (handling null values correctly)

            var jsonContent = new StringContent(JsonSerializer.Serialize(parameters, PROMPT_SERIALZIER_OPTIONS), Encoding.UTF8, "application/json");

            // Step 3: Send the request and get the response
            var response = await client.PostAsync(apiUrl, jsonContent);
            var jsonResponse = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode) {
                throw new InvalidOperationException($"Failed to generate image. Status: {response.StatusCode}. Response: {jsonResponse}");
            }

            Txt2ImgResponse? returnResponse;
            try {
                returnResponse = JsonSerializer.Deserialize<Txt2ImgResponse>(jsonResponse, IMAGE_DESERIALIZER_OPTIONS);
            }
            catch (JsonException e) {
                Console.Write(e);
                returnResponse = null;
            }

            // Step 4: Deserialize response, handling nulls safely
            return returnResponse;

            
        }

        public async Task InterruptGeneration() {
            var client = new HttpClient();
            await client.PostAsync(api + "/sdapi/v1/progress", null );
        }

        public async Task<string> GetCurrentModel() {
            string apiUrl = api + "/sdapi/v1/options";
            using var client = new HttpClient();

            // Step 1: Get current options
            var response = await client.GetStringAsync(apiUrl);
            var options = JsonSerializer.Deserialize<Dictionary<string, object>>(response);

            return options == null || !options.TryGetValue(SD_MODEL_CHECKPOINT, out object? value) || value == null
                ? throw new InvalidOperationException("Failed to retrieve options.")
                : value.ToString() ?? "";
        }

        public async Task ChangeModel(string model) {
            string apiUrl = api + "/sdapi/v1/options";
            using var client = new HttpClient() {
                Timeout = TimeSpan.FromMinutes(10)
            };

            // Step 1: Get current options
            var response = await client.GetStringAsync(apiUrl);
            var options = JsonSerializer.Deserialize<Dictionary<string, object>>(response);

            if (options == null || !options.ContainsKey(SD_MODEL_CHECKPOINT)) {
                throw new InvalidOperationException("Failed to retrieve options.");
            }

            // Step 2: Modify the model name (replace with your desired model)
            options[SD_MODEL_CHECKPOINT] = model;

            // Step 3: Serialize and send the updated options
            var jsonContent = new StringContent(JsonSerializer.Serialize(options), Encoding.UTF8, "application/json");
            var postResponse = await client.PostAsync(apiUrl, jsonContent);

            if (!postResponse.IsSuccessStatusCode) {
                throw new InvalidOperationException($"Failed to change model. Status: {postResponse.StatusCode}");
            }
        }

        public async Task<List<Upscaler>> AvailableUpscalers() {
            var client = new HttpClient();
            var response = await client.GetStringAsync(api + "/sdapi/v1/upscalers");

            return JsonSerializer.Deserialize<List<Upscaler>>(response, DESERIALIZER_OPTIONS) ?? throw new InvalidOperationException("No Upscalers found");
        }

        public async Task<ExtrasResponse> HiResImage(HiResParameters parameters) {
            string apiUrl = api + "/sdapi/v1/extra-single-image";
            using var client = new HttpClient();


            // Step 2: Serialize parameters (handling null values correctly)

            var jsonContent = new StringContent(JsonSerializer.Serialize(parameters, PROMPT_SERIALZIER_OPTIONS), Encoding.UTF8, "application/json");

            // Step 3: Send the request and get the response
            var response = await client.PostAsync(apiUrl, jsonContent);
            var jsonResponse = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode) {
                throw new InvalidOperationException($"Failed to generate image. Status: {response.StatusCode}. Response: {jsonResponse}");
            }

            ExtrasResponse? returnResponse;
            try {
                returnResponse = JsonSerializer.Deserialize<ExtrasResponse>(jsonResponse, IMAGE_DESERIALIZER_OPTIONS);
            }
            catch (JsonException e) {
                Console.Write(e);
                returnResponse = null;
            }

            // Step 4: Deserialize response, handling nulls safely
            return returnResponse ?? throw new InvalidOperationException("Uhhh....");

        }

        public async Task<Dictionary<string, List<string>>> GetWildcards() {
            var client = new HttpClient();
            var response = await client.GetStringAsync(api + "/sd-wildcard-browser/wildcards");

            return JsonSerializer.Deserialize<Dictionary<string, List<string>>>(response, DESERIALIZER_OPTIONS) ?? throw new InvalidOperationException("No wildcards found");
        }

    }
}
