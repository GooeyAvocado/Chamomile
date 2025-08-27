using Chamomile.Data.Utils;
using Chamomile.Data;
using Microsoft.AspNetCore.Mvc;
using Chamomile.Common;
namespace Chamomile.API.Controllers {

    [ApiController]
    [Route("api/Grids")]
    public class GridsController : ControllerBase {

        readonly GridsDAO dao;
        
        public GridsController() {
            dao = new(new EnvironmentKey("DB_URL", () => throw new InvalidOperationException("")).ToString());
        }

        #region CREATE
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Grid grid) { 
            return Ok(await dao.Create(grid));
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

        
        #endregion

        #region UPDATE

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] Grid grid) {
            return Ok(await dao.Update(grid));
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
