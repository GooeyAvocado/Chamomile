using Chamomile.Data.Utils;
using Chamomile.Data;
using Microsoft.AspNetCore.Mvc;
using Automatic1111.API;
using Chamomile.Common;

namespace Chamomile.API.Controllers {

    [ApiController]
    [Route("api/models")]
    public class ModelController : ControllerBase {

        readonly ModelDAO dao;
        readonly A111Api api;

        public ModelController() {
            dao = new(new EnvironmentKey("DB_URL", () => throw new InvalidOperationException("")).ToString());
            api = new(new EnvironmentKey("SD_URL", () => throw new InvalidOperationException("")).ToString());
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() { 
            return Ok(await dao.GetAll());
        }

        [HttpGet("current")]
        public async Task<IActionResult> GetCurrent() {
            var model = await api.GetCurrentModel();
            return Ok(new Dictionary<string, object>() {
                { "model", model }
            });
        }

        [HttpPost("current")]
        public async Task<IActionResult> ChangeModel([FromBody]Dictionary<string,object> options) {
            await api.ChangeModel(options["model"].ToString() ?? "");
            return Ok();
        }

        [HttpGet("refresh")]
        public async Task<IActionResult> Refresh() {
            try {
                var availableModels = await api.GetModels();
                await dao.UpdateAll(availableModels);
            }
            catch (Exception) {Console.WriteLine("SD is offline, returning existing models");}
            return Ok(await dao.GetAll());
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] Model model) {
            await dao.Update(model);
            return Ok();
        }
    }
}
