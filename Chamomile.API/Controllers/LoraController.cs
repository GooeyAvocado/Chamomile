using Chamomile.Data.Utils;
using Chamomile.Data;
using Microsoft.AspNetCore.Mvc;
using Automatic1111.API;
using Chamomile.Common;

namespace Chamomile.API.Controllers {

    [ApiController]
    [Route("api/loras")]
    public class LoraController : ControllerBase {

        readonly LoraDAO dao;
        readonly A111Api api;

        public LoraController() {
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

        [HttpGet("refresh")]
        public async Task<IActionResult> Refresh() {
            var errorModels = new List<Model>();
            try {
                await api.RefreshLoras();
                var availableLoras = await api.GetLoras();
                errorModels = await dao.UpdateAll(availableLoras);
            }
            catch (Exception E) {
                Console.WriteLine(E);
                Console.WriteLine("SD is offline, returning existing models"); 
            }

            return Ok(new ModelRefreshResponse() {
                ErrorModels = errorModels,
                Models = await dao.GetAll()
            });
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] Model lora) {
            await dao.Update(lora);
            return Ok();
        }
    }
}
