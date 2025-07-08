using Automatic1111.API;
using Automatic1111.Common;
using Chamomile.API.Requests;
using Chamomile.API.Workers;
using Chamomile.Common;
using Chamomile.Common.Exceptions;
using Chamomile.Data;
using Chamomile.Data.Utils;
using Hue.Common;
using Microsoft.AspNetCore.Mvc;
using static Chamomile.API.Workers.ImageGeneratorWorker;

namespace Chamomile.API.Controllers {

    [ApiController]
    [Route("api/images")]
    public class ImageController : ControllerBase {

        readonly ImagesDAO dao;
        readonly A111Api api;
        readonly ImageGeneratorWorker worker;

        public ImageController(ImageGeneratorWorker worker) {
            this.worker = worker;
            dao = new(new EnvironmentKey("DB_URL", () => throw new InvalidOperationException("")).ToString());
            api = new(new EnvironmentKey("SD_URL", () => throw new InvalidOperationException("")).ToString());
        }

        #region CREATE

        [HttpPost]
        public async Task<IActionResult> Create(IFormFile file) {
            if (file == null || file.Length == 0) { return BadRequest("No data!"); }
            if (file.Length > 5 * 1024 * 1024) { return BadRequest("File Too Large!"); }
            if (!ImageDownload.AcceptableMimeTypeExtensions.ContainsKey(file.ContentType)) {
                return BadRequest("Unacceptable type, must be an image!");
            }

            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            var fileBytes = memoryStream.ToArray();
            
            var img = await dao.CreateImage(fileBytes);

            return Ok(img);

        }

        [HttpPost("generate")]
        public IActionResult Generate([FromBody] Prompt prompt) {
            return Ok(new Dictionary<string, object>() {
                { "jobId", worker.EnqueuePrompt(prompt) }
            });
        }

        [HttpPost("preview")]
        public async Task<IActionResult> Preview([FromBody] Prompt prompt) {

            //We don't need to try catch this. if it fails it fails lmao
            var model = await api.GetCurrentModel();
            var response = await api.GenerateImage(new() {
                batch_size = 1,
                cfg_scale = prompt.CFGScale ?? 7.0,
                prompt = CommentsPattern().Replace(prompt.PositivePrompt, ""),
                negative_prompt = CommentsPattern().Replace(prompt.NegativePrompt ?? "", ""),
                width = prompt.Width ?? 1024,
                height = prompt.Height ?? 1024,
                n_iter = 1,
                sampler_name = prompt.Sampler ?? null,
                scheduler = prompt.ScheduleType ?? null,
                seed = prompt.Seed ?? -1,
                steps = prompt.Steps ?? 10,
                save_images = false,
                send_images = true,
            });

            var img = await dao.ParseImage(Convert.FromBase64String(response.images[0]),prompt.PositivePrompt);

            return Ok(new PreviewReponse() { 
                Data = response.images[0],
                Metadata = img
            });               
            
        }

        [HttpPost("generateMany")]
        public IActionResult GenerateMany([FromBody] List<Prompt> prompts) {
            List<long> jobIds = [];
            
            foreach (var prompt in prompts) {
                try {
                    jobIds.Add(worker.EnqueuePrompt(prompt)) ;
                }
                catch {}
            }

            return Ok(new Dictionary<string, object>() {
                { "jobIds", jobIds  }
            });
        }

        [HttpPost("Albums")]
        public async Task<IActionResult> CreateAlbum([FromBody] AlbumCreateRequest request) {
            try { return Ok(await dao.CreateAlbum(request, request.AddExisting)); }
            catch (ValidationException e) { return BadRequest(new Dictionary<string, string> { { "field", e.Field }, { "message", e.Message } }); }
        }

        #endregion

        #region READ

        [HttpGet("queue")]
        public IActionResult GetQueue() {
            return Ok(worker.GetAllPrompts());
        }

        [HttpGet("current")]
        public IActionResult GetCurrent() {
            var current = worker.CurrentPrompt;
            return Ok(current);
            return current == null 
                ? NotFound()
                : Ok(current);
        }

        [HttpGet("cancel/{id}")]
        public IActionResult CancelJob(long id) {
            return Ok(worker.CancelPrompt(id));
        }

        [HttpGet("progress")]
        public async Task<IActionResult> CurrentProgress() {
            return Ok(await api.GetProgress());
        }

        [HttpGet("interrupt")]
        public async Task<IActionResult> Interrupt() {
            await api.InterruptGeneration();
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] FilterOptions options) {
            try {
                return Ok(await dao.GetAll(options, options.LastImage ?? 0));
            }
            catch (Npgsql.PostgresException e) {
                if (e.MessageText.Contains("tsquery"))
                    return BadRequest(new Exception(e.MessageText));
                else throw;
            } 
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetAllCount([FromQuery] FilterOptions options) {
            var count = await dao.GetAllCount(options);
            return Ok(new Dictionary<string,object>() { { "count", count } });
        }

        [HttpGet("{ID}")]
        public async Task<IActionResult> Get(int ID) {
            return Ok(await dao.Get(ID));
        }

        [HttpGet("{ID}/image")]
        public async Task<IActionResult> GetImage(int ID, [FromQuery] bool NoCache = false) {
            var file = await dao.GetImage(ID);

            if (file == null || file.Data == null || file.Mime == null) return NotFound();

            Response.Headers.Append("Content-Disposition", "inline; filename=" + new string(file.FullFilename.Where(c => c < 128).ToArray()));
            Response.Headers.CacheControl = NoCache ? "no-cache" : "public, max-age=90000";
            Response.Headers.Vary = "Cookie";
            Response.Headers.ETag = file.Hash;

            // Not modified
            return Request.Headers.IfNoneMatch == file.Hash ? StatusCode(304) : File(file.Data, file.Mime);
        }

        [HttpGet("{ID}/image/HiRes")]
        public async Task<IActionResult> GetHiResImage(int ID, [FromQuery] bool NoCache = false) {
            var file = await dao.GetHiResImage(ID);

            if (file == null || file.Data == null || file.Mime == null) return NotFound();

            Response.Headers.Append("Content-Disposition", "inline; filename=" + new string(file.FullFilename.Where(c => c < 128).ToArray()));
            Response.Headers.CacheControl = NoCache ? "no-cache" : "public, max-age=90000";
            Response.Headers.Vary = "Cookie";
            Response.Headers.ETag = file.Hash;

            // Not modified
            return Request.Headers.IfNoneMatch == file.Hash ? StatusCode(304) : File(file.Data, file.Mime);
        }

        [HttpGet("{ID}/image.png")]
        public async Task<IActionResult> GetImageDownload(int ID) {
            var file = await dao.GetHiResImage(ID);


            if (file == null) return NotFound();
            if (file.Data == null) file = await dao.GetImage(ID); //Try and grab the non-hi res
            if (file == null || file.Data==null) return NotFound();


            // Not modified
            return File(file.Data, file.Mime, new string(file.FullFilename.Where(c => c < 128).ToArray()));
        }

        [HttpGet("{ID}/Albums")]
        public async Task<IActionResult> GetImageAlbums(int ID) { 
            return Ok(await dao.GetImageAlbums(ID));
        }

        [HttpGet("Albums")]
        public async Task<IActionResult> GetAlbums() {
            return Ok(await dao.GetAlbums());
        }

        #endregion

        #region UPDATE

        [HttpPut]
        public async Task<IActionResult> Favorite([FromBody] GeneratedImage image) {
            return Ok(await dao.Favorite(image.Id, image.Favorite));
        }

        [HttpPost("hiRes")]
        public async Task<IActionResult> HiRes([FromBody] HiResRequest options) {
            var hiResParameters = new HiResParameters() { 
                upscaler_1 = options.Upscaler,
                upscaling_resize = options.ResizeFactor,
                image = Convert.ToBase64String((await dao.GetImage(options.ImageID))?.Data ?? throw new ArgumentNullException("Image doesn't exist"))
            };

            var hiRes = await api.HiResImage(hiResParameters);
            return hiRes == null
                ? throw new InvalidOperationException("Waos")
                : Ok(await dao.SaveHiResImage(options.ImageID, Convert.FromBase64String(hiRes.image)));
        }

        [HttpPut("Albums")]
        public async Task<IActionResult> UpdateAlbum([FromBody] Album album) {
            try { return Ok(await dao.UpdateAlbum(album));  }
            catch (ValidationException e) { return BadRequest(new Dictionary<string, string> { { "field",e.Field}, { "message", e.Message } }); }
        }

        [HttpPut("{ID}/Albums")]
        public async Task<IActionResult> GetImageAlbums([FromBody] ImageAlbumRequest request, int ID) {
            switch (request.Mode) {
                case "ADD":
                    try {
                        await dao.AddImageToAlbum(ID, request.AlbumId);
                    }
                    catch (ValidationException e) {
                        return BadRequest(new Dictionary<string, string> { { "field", e.Field }, { "message", e.Message } });
                    }
                    
                    break;
                case "REMOVE":
                    await dao.RemoveImageFromAlbum(ID,request.AlbumId);
                    break;
                default:
                    throw new InvalidOperationException("Invalid mode (Should be ADD or REMOVE): " + request.Mode);
            }
            return Ok();
        }

        #endregion

        #region DELETE
        [HttpDelete("{ID}")]
        public async Task<IActionResult> Delete(int ID) {
            await dao.DeleteImage(ID);
            return Ok();
        }
        #endregion

        [HttpDelete("Albums/{ID}")]
        public async Task<IActionResult> DeleteAlbum(int ID) {
            await dao.DeleteAlbum(ID);
            return Ok();
        }


    }
}
