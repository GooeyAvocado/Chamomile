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

        [HttpGet("refresh")]
        public async Task<IActionResult> Refresh() {
            try {
                var availableLoras = await api.GetLoras();
                await dao.UpdateAll(availableLoras);
            }
            catch (Exception E) {
                Console.WriteLine(E);
                Console.WriteLine("SD is offline, returning existing models"); 
            }
            return Ok(await dao.GetAll());
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] Lora lora) {
            await dao.Update(lora);
            return Ok();
        }
    }
}
