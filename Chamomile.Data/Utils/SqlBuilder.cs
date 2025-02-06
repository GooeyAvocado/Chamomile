namespace Chamomile.Data.Utils {
    public class SqlBuilder {

        public enum WhereConditionOperator {
            EQUALS, GREATER_THAN, LESS_THAN, GREATER_OR_EQUAL, LESS_OR_EQUAL, IN, NOT_EQUALS, NOT_IN, LIKE, ILIKE, NOT_LIKE, NOT_ILIKE, IS_NULL, IS_NOT_NULL
        };

        public enum WhereConditionUnion {
            AND, OR
        };

        public enum SortOrder { 
            ASC, DESC
        }

        public class WhereConditionGroup(WhereConditionUnion union, List<WhereCondition> conditions) {
            public WhereConditionGroup(List<WhereCondition> conditions) : this(WhereConditionUnion.AND,conditions) { }

            public override string ToString() {
                if (conditions.Count == 0) return "TRUE";
                return string.Join(union switch {
                    WhereConditionUnion.AND => " AND ",
                    WhereConditionUnion.OR => " OR ",
                    _ => ""
                }, conditions.Select(a => a.ToString()));
            }
        }

        public class WhereConditionSubgroup(WhereConditionGroup group) : WhereCondition("") {
            public override string ToString() {
                return group.ToString().Trim().Length == 0 ? "" : "(" + group.ToString() + ")";
            }
        }

        public class JoinCondition(string table1Alias, string table2Alias, string joinColumn) 
            : WhereCondition($"{table1Alias}.{joinColumn}",WhereConditionOperator.EQUALS,$"{table2Alias}.{joinColumn}") { }

        public class WhereCondition(string column, WhereConditionOperator operation, string value) {

            public WhereCondition(string column) : this(column, WhereConditionOperator.EQUALS, $"@{column}") { }
            public WhereCondition(string column, WhereConditionOperator operation) : this(column, operation, $"@{column}") { }
            public WhereCondition(string column, List<string> vals) : this(column, WhereConditionOperator.IN,
                "(" + string.Join(",", vals) + ")"
                ) { }
            public WhereCondition(string column, List<int> vals) : this(column, WhereConditionOperator.IN,
                "(" + string.Join(",", vals) + ")"
                ) { }

            public override string ToString() => @$"{column} {operation switch {
                WhereConditionOperator.EQUALS => "=",
                WhereConditionOperator.NOT_EQUALS => "!=",
                WhereConditionOperator.GREATER_THAN => ">",
                WhereConditionOperator.LESS_THAN => "<",
                WhereConditionOperator.GREATER_OR_EQUAL => ">=",
                WhereConditionOperator.LESS_OR_EQUAL => "<=",
                WhereConditionOperator.IN => "IN",
                WhereConditionOperator.NOT_IN => "NOT IN",
                WhereConditionOperator.ILIKE => "ILIKE",
                WhereConditionOperator.NOT_ILIKE => "NOT ILIKE",
                WhereConditionOperator.LIKE => "LIKE",
                WhereConditionOperator.NOT_LIKE => "NOT LIKE",
                WhereConditionOperator.IS_NULL => "IS NULL",
                WhereConditionOperator.IS_NOT_NULL => "IS NOT NULL",
                _ => throw new NotImplementedException(),
            }} {((int)operation < 12 ? value : "")}";

        }
                
        public class OrderBy(string column, SortOrder order) {
            public OrderBy(string column) : this(column,SortOrder.ASC) { }

            public override string ToString() =>  $"{column} {order switch {
                SortOrder.ASC => "ASC",
                SortOrder.DESC => "DESC",
                _ => throw new NotImplementedException(),
            }}";
            
        }

        public static string SelectSql(List<string> columns, string table, bool distinct = false) => $@"
SELECT {(distinct ? "DISTINCT" : "")} {string.Join(",", columns)}
FROM {table}
";

        public static string SelectSql(List<string> columns, string table, WhereConditionGroup conditions, bool distinct = false) => $@"
SELECT {(distinct ? "DISTINCT" : "")} {string.Join(",", columns)}
FROM {table}
WHERE {conditions}
";

        public static string SelectSql(List<string> columns, string table, WhereConditionGroup conditions, List<OrderBy> order, bool distinct = false) => $@"
SELECT {(distinct ? "DISTINCT" : "")} {string.Join(",", columns)}
FROM {table}
WHERE {conditions}
ORDER BY {string.Join(", ", order.Select(a=>a.ToString()))}
";
        public static string SelectSql(List<string> columns, string table, WhereConditionGroup conditions, List<OrderBy> order, int limit, int offset, bool distinct = false) => $@"
SELECT {(distinct ? "DISTINCT" : "")} {string.Join(",", columns)}
FROM {table}
WHERE {conditions}
ORDER BY {string.Join(", ", order.Select(a => a.ToString()))}
LIMIT {limit}
OFFSET {offset}
";

        public static string InsertSql(List<string> columns, string table) => InsertSql(columns, table, null);

        public static string InsertSql(List<string> columns, string table, string? returning) => $@"
INSERT INTO {table} ({string.Join(",",columns)})
VALUES ({string.Join(",",columns.Select(a=>$"@{a}"))})
{(string.IsNullOrWhiteSpace(returning) ? "" : $"RETURNING {returning}")}
";

        public static string InsertSql(List<string> columns, Dictionary<string,string> setValues, string table,  string? returning) => $@"
INSERT INTO {table} ({string.Join(",", columns)})
VALUES ({string.Join(",", columns.Select(a => setValues.GetValueOrDefault(a) ?? $"@{a}"))})
{(string.IsNullOrWhiteSpace(returning) ? "" : $"RETURNING {returning}")}
";

        public static string UpdateSql(List<string> columns, string table, WhereConditionGroup conditions) => $@"
UPDATE {table} SET
{string.Join(",",columns.Select(a=> $"{a}=@{a}" ))}
WHERE {conditions}
";

        public static string UpdateSql(List<string> columns, Dictionary<string, string> setValues, string table, WhereConditionGroup conditions) => $@"
UPDATE {table} SET
{string.Join(",", columns.Select(a => $"{a}={setValues.GetValueOrDefault(a) ?? $"@{a}"}"))}
WHERE {conditions}
";

        public static string DeleteSql(string table, WhereConditionGroup conditions) => $@"
DELETE FROM {table} where {conditions}
";

    }
}
