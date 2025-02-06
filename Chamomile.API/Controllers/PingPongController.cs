using Chamomile.Data.Utils;
using Chamomile.Data;
using Microsoft.AspNetCore.Mvc;
using Automatic1111.API;

namespace Chamomile.API.Controllers {

    [ApiController]
    [Route("api/ping")]
    public class PingPongController : ControllerBase {
        
        readonly PingDAO dao;
        readonly A111Api api;

        public PingPongController() {
            dao = new(new EnvironmentKey("DB_URL", () => throw new InvalidOperationException("")).ToString());
            api = new(new EnvironmentKey("SD_URL", () => throw new InvalidOperationException("")).ToString());
        }


        [HttpGet]
        public async Task<IActionResult> PingPong() {

            var db = await dao.Ping();
            var sd = await api.Ping();

            return Ok(new Dictionary<string,object>() {
                {"DB", db},
                {"SD", sd}
            });
        }

    }
}
