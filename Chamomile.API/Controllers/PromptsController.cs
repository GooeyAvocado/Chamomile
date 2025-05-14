using Chamomile.Data.Utils;
using Chamomile.Data;
using Microsoft.AspNetCore.Mvc;
using Chamomile.Common;
using Automatic1111.API;

namespace Chamomile.API.Controllers {

    [ApiController]
    [Route("api/prompts")]
    public class PromptsController : ControllerBase {

        readonly PromptsDAO dao;
        readonly A111Api api;

        public PromptsController() {
            dao = new(new EnvironmentKey("DB_URL", () => throw new InvalidOperationException("")).ToString());
            api = new(new EnvironmentKey("SD_URL", () => throw new InvalidOperationException("")).ToString());
        }

        #region CREATE
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Prompt prompt) { 
            await dao.Create(prompt);
            return Ok();
        }
        #endregion

        #region READ

        [HttpGet]
        public async Task<IActionResult> GetAll() { 
            return Ok(await dao.GetAll());
        }

        [HttpGet("{ID}")]
        public async Task<IActionResult> Get(int ID) {
            return Ok(await dao.Get(ID));
        }

        [HttpGet("wildcards")]
        public async Task<IActionResult> GetWildcards() {
            return Ok(await api.GetWildcards());
        }

        [HttpGet("schedulers")]
        public async Task<IActionResult> GetSchedulers() {
            return Ok(await api.GetSchedulers());
        }

        [HttpGet("samplers")]
        public async Task<IActionResult> GetSamplers() {
            return Ok(await api.GetSamplers());
        }

        #endregion

        #region UPDATE

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] Prompt prompt) {
            await dao.Update(prompt);
            return Ok();
        }

        #endregion

        #region DELETE

        [HttpDelete("{ID}")]
        public async Task<IActionResult> Delete(int ID) {
            await dao.Delete(ID);
            return Ok();
        }

        #endregion
    }
}
