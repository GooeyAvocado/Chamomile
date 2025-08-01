import KeywordUsageDated from "./KeywordUsageDated";

export default interface KeywordUsageDatedResult {
    maxUsage: number;
    minTs: string;
    maxTs: string;
    usage: { [key: string]: KeywordUsageDated[] };
}