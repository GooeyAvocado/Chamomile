export default interface GeneralStatistics {
    minTs: string
    maxTs: string
    favCount: number
    upscaledCount: number
    downloadCount: number
    totalDownloads: number
    totalCount: number
    avgGenTime: number
    maxImageId: number
    countBySource: Record<string, number>
}