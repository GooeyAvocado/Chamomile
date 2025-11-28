using Chamomile.Data.Utils;
using Chamomile.Data;
using Microsoft.AspNetCore.Mvc;
using Automatic1111.API;
using Chamomile.Common;

namespace Chamomile.API.Controllers {

    [ApiController]
    [Route("api/checkpoints")]
    public class CheckpointController : ControllerBase {

        readonly CheckpointDAO dao;
        readonly A111Api api;

        public CheckpointController() {
            dao = new(new EnvironmentKey("DB_URL", () => throw new InvalidOperationException("")).ToString());
            api = new(new EnvironmentKey("SD_URL", () => throw new InvalidOperationException("")).ToString());
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() { 
            return Ok(await dao.GetAll());
        }

        [HttpGet("tags")]
        public async Task<IActionResult> GetTags() {
            return Ok(await dao.GetAllTags());
        }

        [HttpGet("usage")]
        public async Task<IActionResult> GetUsage([FromQuery] FilterOptions options) {
            return Ok(await dao.GetUsage(options,options.LastImage ?? -1));
        }

        [HttpGet("datedusage")]
        public async Task<IActionResult> GetDatedUsage([FromQuery] KeywordFilterOptions options) {
            return Ok(await Utils.Utils.GetUsage(dao.GetUsageDated, options));
        }


        [HttpGet("upscalers")]
        public async Task<IActionResult> GetAllUpscalers() {
            return Ok(new Dictionary<string, object>() {
                { "upscalers", (await api.AvailableUpscalers()).Select(a=>a.name).ToList() }
            });
        }

        [HttpGet("current")]
        public async Task<IActionResult> GetCurrent() {
            var model = await api.GetCurrentCheckpoint();
            return Ok(new Dictionary<string, object>() {
                { "checkpoint", model }
            });
        }

        [HttpPost("current")]
        public async Task<IActionResult> ChangeCheckpoint([FromBody]Dictionary<string,object> options) {
            await api.ChangeCheckpoint(options["checkpoint"].ToString() ?? "");
            return Ok();
        }

        [HttpGet("refresh")]
        public async Task<IActionResult> Refresh() {
            try {
                await api.RefreshCheckpoints();
                var availableModels = await api.GetCheckpoints();
                await dao.UpdateAll(availableModels);
            }
            catch (Exception e) {
                Console.WriteLine(e);
                Console.WriteLine("SD is offline, returning existing models");
            }
            return Ok(await dao.GetAll());
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] Model checkpoint) {
            await dao.Update(checkpoint);
            return Ok();
        }
    }
}
