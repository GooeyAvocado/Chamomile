using Automatic1111.API;
using Automatic1111.Common;
using Chamomile.API.Requests;
using Chamomile.API.Utils;
using Chamomile.API.Workers;
using Chamomile.Common;
using Chamomile.Common.Exceptions;
using Chamomile.Data;
using Chamomile.Data.Utils;
using Microsoft.AspNetCore.Mvc;
using System.Drawing;
using static Chamomile.API.Workers.ImageGeneratorWorker;

namespace Chamomile.API.Controllers
{

    [ApiController]
    [Route("api/images")]
    public class ImageController(ImageGeneratorWorker worker) : ControllerBase
    {

        readonly ImagesDAO dao = new(new EnvironmentKey("DB_URL", () => throw new InvalidOperationException("")).ToString());
        readonly GridsDAO gridDao = new(new EnvironmentKey("DB_URL", () => throw new InvalidOperationException("")).ToString());
        readonly A111Api api = new(new EnvironmentKey("SD_URL", () => throw new InvalidOperationException("")).ToString());
        readonly ImageGeneratorWorker worker = worker;

        #region CREATE

        [HttpPost]
        public async Task<IActionResult> Create(IFormFile file, [FromQuery] int? albumId)
        {
            if (file == null || file.Length == 0) { return BadRequest("No data!"); }
            if (file.Length > 5 * 1024 * 1024) { return BadRequest("File Too Large!"); }
            if (!ImageDownload.AcceptableMimeTypeExtensions.ContainsKey(file.ContentType))
            {
                return BadRequest("Unacceptable type, must be an image!");
            }

            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            var fileBytes = memoryStream.ToArray();

            var UploadDetails = new Dictionary<string, string>() {
                {"source","UPLOAD" },
                {"filename",file.FileName }
            };

            try
            {
                var img = await dao.CreateImage(fileBytes, null, null, UploadDetails, false);

                if (albumId.HasValue)
                {
                    try
                    {
                        await dao.AddImageToAlbum(img.Id, albumId.Value);
                    }
                    catch (ValidationException e)
                    {
                        return BadRequest(new Dictionary<string, string> { { "field", e.Field }, { "message", e.Message } });
                    }
                    img.Albums = [.. img.Albums.Union([albumId.Value])];
                }

                return Ok(img);
            }
            catch (InvalidOperationException e)
            {
                return BadRequest(new Dictionary<string, string> { { "error", e.Message } });
            }
        }

        [HttpPost("generateGrid")]
        public async Task<IActionResult> GenerateGrid([FromBody] GenerateGridRequest request) {

            //Get the grid,
            var grid = await gridDao.Get(request.Id);
            if (grid == null) { return NotFound(); }

            //Get the coordinates and map them to prompts
            List<Prompt> prompts = [.. request.Coordinates.Select(coord 
                => GridTypes.ApplyGridToPrompt(
                    GridTypes.ApplyGridToPrompt(new Prompt() {
                CFGScale = grid.CFGScale,
                Height = grid.Height,
                Width = grid.Width,
                Name=grid.Name,
                NegativePrompt=grid.NegativePrompt,
                PositivePrompt=grid.Prompt,
                Sampler=grid.Sampler,
                ScheduleType=grid.ScheduleType,
                Seed=grid.Seed,
                Steps=grid.Steps,
                Variables=[],
                OrderData=new (){
                    Source="GRID",
                    GridId=grid.Id,
                    XPos=coord.X,
                    YPos=coord.Y,
                    XVal=grid.XVals[coord.X],
                    YVal=grid.YVals[coord.Y],
                }

            },grid.XValMode,grid.XVals[coord.X],grid.XVals)
                ,grid.YValMode,grid.YVals[coord.Y],grid.YVals
                    ))];

            //Enqueue and adios

            return Ok(new Dictionary<string, object>() {
                { "jobIds", worker.EnqueuePrompts(prompts) }
            });
        }

        [HttpPost("preview")]
        public async Task<IActionResult> Preview([FromBody] Prompt prompt)
        {

            //We don't need to try catch this. if it fails it fails lmao
            var response = await api.GenerateImage(new()
            {
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
            }) ?? throw new InvalidOperationException("API responded with nothing");

            var img = await dao.ParseImage(Convert.FromBase64String(response.images[0]));

            return Ok(new PreviewReponse()
            {
                Data = response.images[0],
                Metadata = img
            });

        }

        [HttpPost("generate")]
        public IActionResult Generate([FromBody] List<Prompt> prompts) {
            return Ok(new Dictionary<string, object>() {
                { "jobIds", worker.EnqueuePrompts(prompts)  }
            });
        }

        [HttpPost("generateNow")]
        public IActionResult GenerateNow([FromBody] List<Prompt> prompts) {
            return Ok(new Dictionary<string, object>() {
                { "jobIds", worker.EnqueuePromptsToFront(prompts)  }
            });
        }

        [HttpPost("moveToFront")]
        public IActionResult MoveToFront([FromBody] List<long> id) {
            return Ok(new Dictionary<string, object>() {
                { "jobIds", worker.MovePromptsToFront(id)  }
            });
        }

        [HttpPost("moveToBack")]
        public IActionResult MoveToBack([FromBody] List<long> id) {
            return Ok(new Dictionary<string, object>() {
                { "jobIds", worker.MovePromptsToBack(id)  }
            });
        }

        [HttpPost("Albums")]
        public async Task<IActionResult> CreateAlbum([FromBody] AlbumCreateRequest request)
        {
            try { return Ok(await dao.CreateAlbum(request, request.AddExisting)); }
            catch (ValidationException e) { return BadRequest(new Dictionary<string, string> { { "field", e.Field }, { "message", e.Message } }); }
        }

        #endregion

        #region READ

        [HttpGet("status")]
        public IActionResult GetStatus()
        {
            return Ok(new ImageWorkerState
            {
                CurrentJob = worker.CurrentPrompt,
                Queue = worker.GetAllPrompts(),
                Paused = worker.IsPaused
            });
        }

        [HttpPost("status")]
        public IActionResult ChangeStatus([FromBody] ImageWorkerState state)
        {
            if (state.Paused) { worker.Pause(); }
            else { worker.Resume(); }

            return GetStatus();
        }

        [HttpGet("cancel")]
        public IActionResult CancelAll()
        {
            worker.ClearQueue();
            return Ok();
        }

        [HttpPost("cancel")]
        public IActionResult CancelJobs([FromBody] List<long> id)
        {
            return Ok(worker.CancelPrompts(id));
        }

        [HttpGet("progress")]
        public async Task<IActionResult> CurrentProgress()
        {
            return Ok(await api.GetProgress());
        }

        [HttpGet("interrupt/{id}")]
        public async Task<IActionResult> Interrupt(int id)
        {
            worker.InterruptJobId(id);
            await api.InterruptGeneration();
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] FilterOptions options)
        {
            try
            {
                return Ok(await dao.GetAll(options, options.LastImage ?? 0, options.DisablePagination ?? false));
            }
            catch (Npgsql.PostgresException e)
            {
                if (e.MessageText.Contains("tsquery"))
                    return BadRequest(new Exception(e.MessageText));
                else throw;
            }
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetAllCount([FromQuery] FilterOptions options)
        {
            var count = await dao.GetAllCount(options);
            return Ok(new Dictionary<string, object>() { { "count", count } });
        }

        [HttpGet("{ID}")]
        public async Task<IActionResult> Get(int ID)
        {
            return Ok(await dao.Get(ID));
        }

        [HttpGet("random")]
        public async Task<IActionResult> GetRandom() {
            return Ok(await dao.GetRandom());
        }

        [HttpGet("{ID}/image")]
        public async Task<IActionResult> GetImage(int ID, [FromQuery] bool NoCache = false, [FromQuery] bool CountDownload = false)
        {
            var file = await dao.GetImage(ID, CountDownload);

            if (file == null || file.Data == null || file.Mime == null) return NotFound();

            Response.Headers.Append("Content-Disposition", "inline; filename=" + new string([.. file.FullFilename.Where(c => c < 128)]));
            Response.Headers.CacheControl = NoCache ? "no-cache" : "public, max-age=90000";
            Response.Headers.Vary = "Cookie";
            Response.Headers.ETag = file.Hash;

            // Not modified
            return Request.Headers.IfNoneMatch == file.Hash ? StatusCode(304) : File(file.Data, file.Mime);
        }

        [HttpGet("{ID}/image/HiRes")]
        public async Task<IActionResult> GetHiResImage(int ID, [FromQuery] bool NoCache = false, [FromQuery] bool CountDownload = false)
        {
            var file = await dao.GetHiResImage(ID, CountDownload);

            if (file == null || file.Data == null || file.Mime == null) return NotFound();

            Response.Headers.Append("Content-Disposition", "inline; filename=" + new string([.. file.FullFilename.Where(c => c < 128)]));
            Response.Headers.CacheControl = NoCache ? "no-cache" : "public, max-age=90000";
            Response.Headers.Vary = "Cookie";
            Response.Headers.ETag = file.Hash;

            // Not modified
            return Request.Headers.IfNoneMatch == file.Hash ? StatusCode(304) : File(file.Data, file.Mime);
        }

        [HttpGet("{ID}/image.png")]
        public async Task<IActionResult> GetImageDownload(int ID, [FromQuery] bool CountDownload = false)
        {
            var file = await dao.GetImageOptionalHires(ID, CountDownload);


            if (file == null) return NotFound();
            if (file == null || file.Data == null) return NotFound();

            // Not modified
            return File(file.Data, file.Mime ?? "image/png", new string([.. file.FullFilename.Where(c => c < 128)]));
        }

        [HttpGet("{ID}/Albums")]
        public async Task<IActionResult> GetImageAlbums(int ID)
        {
            return Ok(await dao.GetImageAlbums(ID));
        }

        [HttpGet("Albums")]
        public async Task<IActionResult> GetAlbums()
        {
            return Ok(await dao.GetAlbums());
        }

        [HttpGet("modelSequence")]
        public IActionResult GetModelSequence()
        {
            return Ok(worker.Sequence);
        }

        [HttpPost("modelSequence")]
        public IActionResult ChangeModelSequence([FromBody] List<CheckpointSequence> sequence)
        {
            worker.Sequence = [.. sequence];
            return Ok(sequence);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats([FromQuery] FilterOptions options) {
            return Ok(await dao.GetGenStatistics(options, options.LastImage ?? -1));
        }

        [HttpGet("datedstats")]
        public async Task<IActionResult> GetDatedStats([FromQuery] KeywordFilterOptions options) {
            return Ok(await Utils.Utils.GetUsage(dao.GetGenStatsDated, options));
        }

        [HttpGet("keywords/usage")]
        public async Task<IActionResult> GetKeywordUsage([FromQuery] FilterOptions options)
        {
            return Ok(await dao.GetKeywordUsage(options, options.LastImage ?? -1));
        }

        [HttpGet("keywords/datedusage")]
        public async Task<IActionResult> GetKeywordDatedUsage([FromQuery] KeywordFilterOptions options)
        {
            return Ok(await Utils.Utils.GetUsage(dao.GetKeywordDatedUsage, options));
        }

        #endregion

        #region UPDATE

        [HttpPut]
        public async Task<IActionResult> Favorite([FromBody] GeneratedImage image)
        {
            return Ok(await dao.Favorite(image.Id, image.Favorite));
        }

        [HttpPut("notes")]
        public async Task<IActionResult> Notes([FromBody] GeneratedImage image)
        {
            return Ok(await dao.UpdateNotes(image.Id, image.Notes ?? ""));
        }

        [HttpPost("hiRes")]
        public async Task<IActionResult> HiRes([FromBody] HiResRequest options)
        {
            var hiResParameters = new HiResParameters()
            {
                upscaler_1 = options.Upscaler,
                upscaling_resize = options.ResizeFactor,
                image = Convert.ToBase64String((await dao.GetImage(options.ImageID))?.Data ?? throw new ArgumentNullException(nameof(options), "Image doesn't exist"))
            };

            var hiRes = await api.HiResImage(hiResParameters);
            return hiRes == null
                ? throw new InvalidOperationException("Waos")
                : Ok(await dao.SaveHiResImage(options.ImageID, Convert.FromBase64String(hiRes.image), options.ResizeFactor));
        }

        [HttpPut("Albums")]
        public async Task<IActionResult> UpdateAlbum([FromBody] Album album)
        {
            try { return Ok(await dao.UpdateAlbum(album)); }
            catch (ValidationException e) { return BadRequest(new Dictionary<string, string> { { "field", e.Field }, { "message", e.Message } }); }
        }

        [HttpPut("{ID}/Albums")]
        public async Task<IActionResult> UpdateImageAlbums([FromBody] ImageAlbumRequest request, int ID)
        {
            switch (request.Mode)
            {
                case "ADD":
                    try
                    {
                        await dao.AddImageToAlbum(ID, request.AlbumId);
                    }
                    catch (ValidationException e)
                    {
                        return BadRequest(new Dictionary<string, string> { { "field", e.Field }, { "message", e.Message } });
                    }

                    break;
                case "REMOVE":
                    await dao.RemoveImageFromAlbum(ID, request.AlbumId);
                    break;
                default:
                    throw new InvalidOperationException("Invalid mode (Should be ADD or REMOVE): " + request.Mode);
            }
            return Ok();
        }

        [HttpPut("multi/Albums")]
        public async Task<IActionResult> UpdateImageAlbums([FromBody] ImageAlbumRequest request)
        {
            if (request.ImageIDs == null || request.ImageIDs.Count == 0) return Ok();
            switch (request.Mode)
            {
                case "ADD":
                    try
                    {
                        await dao.AddImagesToAlbum(request.ImageIDs, request.AlbumId);
                    }
                    catch (ValidationException e)
                    {
                        return BadRequest(new Dictionary<string, string> { { "field", e.Field }, { "message", e.Message } });
                    }

                    break;
                case "REMOVE":
                    foreach (var ID in request.ImageIDs)
                    {
                        await dao.RemoveImageFromAlbum(ID, request.AlbumId);
                    }
                    break;
                default:
                    throw new InvalidOperationException("Invalid mode (Should be ADD or REMOVE): " + request.Mode);
            }
            return Ok();
        }

        #endregion

        #region DELETE
        [HttpDelete("{ID}")]
        public async Task<IActionResult> Delete(int ID)
        {
            await dao.DeleteImage(ID);
            return Ok();
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteMultiple([FromBody] Dictionary<string, List<int>> body)
        {
            if (body["ids"] == null) return BadRequest("Use field 'ids'");
            foreach (var item in body["ids"])
            {
                await dao.DeleteImage(item);
            }
            return Ok();
        }

        #endregion

        [HttpDelete("Albums/{ID}")]
        public async Task<IActionResult> DeleteAlbum(int ID)
        {
            await dao.DeleteAlbum(ID);
            return Ok();
        }


    }
}
