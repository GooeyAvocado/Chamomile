using Npgsql;
using NpgsqlTypes;
using System.Data;

namespace Chamomile.Data.Utils {

    public class AdoTemplate(string connectionString) {

        public class Setter(Action<string, NpgsqlDbType, object?> Set) {

            public void SetBoolean(string key, bool? value) => Set(key, NpgsqlDbType.Boolean, value);
            public void SetInt(string key, int? value) => Set(key, NpgsqlDbType.Integer, value);
            public void SetLong(string key, long? value) => Set(key, NpgsqlDbType.Bigint, value);
            public void SetDouble(string key, double? value) => Set(key, NpgsqlDbType.Double, value);
            public void SetString(string key, string? value) => Set(key, NpgsqlDbType.Varchar, value);
            public void SetGuid(string key, Guid? value) => Set(key, NpgsqlDbType.Uuid, value);
            public void SetBytea(string key, byte[]? value) => Set(key, NpgsqlDbType.Bytea, value);
            public void SetTimestamp(string key, DateTime? value) => Set(key, NpgsqlDbType.TimestampTz, value);
            public void SetDate(string key, DateTime? value) => Set(key, NpgsqlDbType.Date, value);

            public void SetValue(string key, NpgsqlDbType type, object? value) => Set(key, type, value);

        }

        public class Getter(IDataReader reader) {

            public bool ContainsKey(string key) {
                try { reader.GetOrdinal(key); }
                catch (IndexOutOfRangeException) { return false; }
                return true;
            }

            public bool IsNull(string key) => !ContainsKey(key) || reader.IsDBNull(reader.GetOrdinal(key));



            public bool GetBoolean(string key) => GetBoolean(reader.GetOrdinal(key));
            public int GetInt(string key) => GetInt(reader.GetOrdinal(key));
            public long GetLong(string key) => GetLong(reader.GetOrdinal(key));
            public double GetDouble(string key) => GetDouble(reader.GetOrdinal(key));
            public string GetString(string key) => GetString(reader.GetOrdinal(key));
            public DateTime GetDateTime(string key) => GetDateTime(reader.GetOrdinal(key));
            public Guid GetGuid(string key) => GetGuid(reader.GetOrdinal(key));
            public byte[] GetBytea(string key) => (byte[])reader[key];
            
            public object GetValue(string key) => reader[key];


            public bool GetBoolean(int index) => reader.GetBoolean(index);
            public int GetInt(int index) => reader.GetInt32(index);
            public long GetLong(int index) => reader.GetInt64(index);
            public double GetDouble(int index) => reader.GetDouble(index);
            public string GetString(int index) => reader.GetString(index);
            public DateTime GetDateTime(int index) => reader.GetDateTime(index);
            public Guid GetGuid(int index) => reader.GetGuid(index);

            public object GetValue(int index) => reader.GetValue(index);


            public bool? GetOptionalBoolean(string key) => GetOptionalBoolean(reader.GetOrdinal(key));
            public int? GetOptionalInt(string key) => GetOptionalInt(reader.GetOrdinal(key));
            public long? GetOptionalLong(string key) => GetOptionalLong(reader.GetOrdinal(key));
            public double? GetOptionalDouble(string key) => GetOptionalDouble(reader.GetOrdinal(key));
            public string? GetOptionalString(string key) => GetOptionalString(reader.GetOrdinal(key));
            public DateTime? GetOptionalDateTime(string key) => GetOptionalDateTime(reader.GetOrdinal(key));
            public Guid? GetOptionalGuid(string key) => GetOptionalGuid(reader.GetOrdinal(key));
            public byte[]? GetOptionalBytea(string key) => reader.IsDBNull(reader.GetOrdinal(key)) ? null : (byte[])reader[key];

            public object? GetOptionalValue(string key) => reader.IsDBNull(reader.GetOrdinal(key)) ? null : reader[key];


            public bool? GetOptionalBoolean(int index) => reader.IsDBNull(index) ? null : reader.GetBoolean(index);
            public int? GetOptionalInt(int index) => reader.IsDBNull(index) ? null : reader.GetInt32(index);
            public long? GetOptionalLong(int index) => reader.IsDBNull(index) ? null : reader.GetInt64(index);
            public double? GetOptionalDouble(int index) => reader.IsDBNull(index) ? null : reader.GetDouble(index);
            public string? GetOptionalString(int index) => reader.IsDBNull(index) ? null : reader.GetString(index);
            public DateTime? GetOptionalDateTime(int index) => reader.IsDBNull(index) ? null : reader.GetDateTime(index);
            public Guid? GetOptionalGuid(int index) => reader.IsDBNull(index) ? null : reader.GetGuid(index);

            public object? GetOptionalValue(int index) => reader.IsDBNull(index) ? null : reader.GetValue(index);

        }

        private readonly string ConnectionString = connectionString;

        public async Task<T?> QuerySingle<T>(string sql, Action<Setter> setter, Func<Getter, T> rowMapper) {
            return (await Query(sql, setter, rowMapper)).FirstOrDefault();
        }

        public async Task<T?> QuerySingle<T>(string sql, Action<Setter> setter, Func<Getter, Task<T>> rowMapper){
            return (await Query(sql, setter, rowMapper)).FirstOrDefault();
        }

        public async Task<List<T>> Query<T>(string sql, Action<Setter> setter, Func<Getter, T> rowMapper){
            var results = new List<T>();

            using var conn = new NpgsqlConnection(ConnectionString);
            await conn.OpenAsync();

            Console.WriteLine(sql);
            using var cmd = new NpgsqlCommand(sql, conn);

            void setParam(string key, NpgsqlDbType type, object? val){
                cmd.Parameters.Add(new NpgsqlParameter(key, type) { Value = val ?? DBNull.Value });
            }

            setter(new Setter(setParam));
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync()) { results.Add(rowMapper(new Getter(reader))); }

            return results;

        }

        public async Task<List<T>> Query<T>(string sql, Action<Setter> setter, Func<Getter, Task<T>> rowMapper){
            var results = new List<T>();

            using var conn = new NpgsqlConnection(ConnectionString);
            await conn.OpenAsync();

            using var cmd = new NpgsqlCommand(sql, conn);

            void setParam(string key, NpgsqlDbType type, object? val)
            {
                cmd.Parameters.Add(new NpgsqlParameter(key, type) { Value = val ?? DBNull.Value });
            }

            setter(new Setter(setParam));
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync()) { results.Add(await rowMapper(new Getter(reader))); }

            return results;

        }

        public async Task<int> Execute(string sql) { return await Execute(sql, (_) => { }); }

        public async Task<int> Execute(string sql, Action<Setter> setter){
            using var conn = new NpgsqlConnection(ConnectionString);
            await conn.OpenAsync();

            using var cmd = new NpgsqlCommand(sql, conn);

            void setParam(string key, NpgsqlDbType type, object? val){
                cmd.Parameters.Add(new NpgsqlParameter(key, type) { Value = val ?? DBNull.Value });
            }

            setter(new Setter(setParam));

            return await cmd.ExecuteNonQueryAsync();
        }

        public async Task<int> ExecuteBatch<T>(string sql, Action<Setter, T> setter, ICollection<T> items){

            if (items.Count == 0) return 0;

            using var conn = new NpgsqlConnection(ConnectionString);
            await conn.OpenAsync();

            using var batch = new NpgsqlBatch(conn);

            foreach (var item in items)
            {
                var batchCommand = new NpgsqlBatchCommand(sql);

                void setParam(string key, NpgsqlDbType type, object? val)
                {
                    batchCommand.Parameters.Add(new NpgsqlParameter(key, type) { Value = val ?? DBNull.Value });
                }

                setter(new Setter(setParam), item);

                batch.BatchCommands.Add(batchCommand);
            }

            return await batch.ExecuteNonQueryAsync();
        }

        public async Task<int> ExecuteBatch<T>(string sql, Func<Setter, T, Task> setter, ICollection<T> items){

            if (items.Count == 0) return 0;

            using var conn = new NpgsqlConnection(ConnectionString);
            await conn.OpenAsync();

            using var batch = new NpgsqlBatch(conn);

            foreach (var item in items)
            {
                var batchCommand = new NpgsqlBatchCommand(sql);

                void setParam(string key, NpgsqlDbType type, object? val)
                {
                    batchCommand.Parameters.Add(new NpgsqlParameter(key, type) { Value = val ?? DBNull.Value });
                }

                await setter(new Setter(setParam), item);

                batch.BatchCommands.Add(batchCommand);
            }

            return await batch.ExecuteNonQueryAsync();
        }
    }
}
