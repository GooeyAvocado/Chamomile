import KeywordUsageDated from "./KeywordUsageDated";

export default interface KeywordUsageDatedResult {
    maxUsage: number;
    maxCumulativeUsage: number;
    minTs: string;
    maxTs: string;
    usage: { [key: string]: KeywordUsageDated[] };
}