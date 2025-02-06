using Chamomile.Data.Utils;

namespace Chamomile.Data {
    public abstract class BaseDAO(string connectionString) {
        protected readonly AdoTemplate adoTemplate = new(connectionString);
    }
}
