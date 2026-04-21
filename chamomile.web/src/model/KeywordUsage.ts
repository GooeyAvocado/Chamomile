export default interface KeywordUsage {
    keyword: string

    count: number
    deletedCount: number
    downloadCount: number
    favoriteCount: number
    upscaleCount: number

    totalCount: number

    successRate: number
    downloadRate: number
    favoriteRate: number
    upscaleRate: number

    sample: number
    minTs: string
    maxTs: string
}