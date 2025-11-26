using Chamomile.Common;
using Chamomile.Data;
using Chamomile.Data.Utils;
using Microsoft.AspNetCore.Mvc;

namespace Chamomile.API.Controllers {

    [ApiController]
    [Route("api/template")]
    public class TemplateController : ControllerBase {

        readonly TemplateDAO dao;

        public TemplateController() {
            dao = new(new EnvironmentKey("DB_URL", () => throw new InvalidOperationException("")).ToString());
        }

        #region CREATE
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Template template) {
            return Ok(await dao.Create(template));
        }
        #endregion

        #region READ

        [HttpGet]
        public async Task<IActionResult> GetAll() {
            return Ok(await dao.GetAll());
        }

        [HttpGet("{name}")]
        public async Task<IActionResult> Get(string name) {
            return Ok(await dao.Get(name));
        }

        #endregion

        #region UPDATE

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] Template template) {
            return Ok(await dao.Update(template));
        }

        #endregion

        #region DELETE

        [HttpDelete("{name}")]
        public async Task<IActionResult> Delete(string name) {
            await dao.Delete(name);
            return Ok();
        }

        #endregion

    }
}
