using Chamomile.Data.Utils;

namespace Chamomile.Data {
    public class PingDAO(string connectionString) {
        readonly AdoTemplate adoTemplate = new(connectionString);
        #region READ

        public async Task<bool> Ping() {
            var sql = "select 1";

            try {
                var pongTime = await adoTemplate.QuerySingle(sql, (cmd) => { }, (reader) => reader.GetOptionalInt(0));
                return pongTime != null;
            }
            catch (Exception e) {
                Console.WriteLine(e.Message);
                return false;
            }

        }

        #endregion

    }
}
