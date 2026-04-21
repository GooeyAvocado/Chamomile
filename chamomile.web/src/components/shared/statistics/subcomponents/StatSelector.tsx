import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import KeywordUsage from "../../../../model/KeywordUsage";

export type Statistic = "TOTAL" | "EXISTING" | "DELETED" | "DOWNLOAD" | "FAVORITE" | "UPSCALE" | "SUCCESS_RATE" | "DOWNLOAD_RATE" | "FAVORITE_RATE" | "UPSCALE_RATE"
export const StatisticOptions: Record<Statistic, {
    sorter: (a: KeywordUsage, b: KeywordUsage) => number
    getStat: (u: KeywordUsage) => number
    formatStat: (u: KeywordUsage) => string
    displayName: string
    shortName: string
    color?: string
}> = {
    "TOTAL": {
        sorter: (a, b) => b.totalCount - a.totalCount,
        getStat: (u) => u.totalCount,
        formatStat: (val) => val.totalCount.toLocaleString(),

        displayName: "Total generated images",
        shortName: "Total"
    },
    "EXISTING": {
        sorter: (a, b) => b.count - a.count,
        getStat: (u) => u.count,
        formatStat: (val) => val.count.toLocaleString(),

        displayName: "Saved images",
        shortName: "Existing"
    },
    "DELETED": {
        sorter: (a, b) => b.deletedCount - a.deletedCount,
        getStat: (u) => u.deletedCount,
        formatStat: (val) => val.deletedCount.toLocaleString(),

        displayName: "Deleted images",
        shortName: "Deleted"
    },
    "DOWNLOAD": {
        sorter: (a, b) => b.downloadCount - a.downloadCount,
        getStat: (u) => u.downloadCount,
        formatStat: (val) => val.downloadCount.toLocaleString(),

        displayName: "Downloaded images",
        shortName: "Downloaded"
    },
    "FAVORITE": {
        sorter: (a, b) => b.favoriteCount - a.favoriteCount,
        getStat: (u) => u.favoriteCount,
        formatStat: (val) => val.favoriteCount.toLocaleString(),

        displayName: "Favorite images",
        shortName: "Favorite"
    },
    "UPSCALE": {
        sorter: (a, b) => b.upscaleCount - a.upscaleCount,
        getStat: (u) => u.upscaleCount,
        formatStat: (val) => val.upscaleCount.toLocaleString(),

        displayName: "Upscaled images",
        shortName: "Upscaled"
    },
    "SUCCESS_RATE": {
        sorter: (a, b) => b.successRate - a.successRate,
        getStat: (u) => u.successRate,
        formatStat: (val) => (val.successRate)
            .toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }),

        displayName: "Generation success rate",
        shortName: "Success %"
    },
    "DOWNLOAD_RATE": {
        sorter: (a, b) => b.downloadRate - a.downloadRate,
        getStat: (u) => u.downloadRate,
        formatStat: (val) => (val.downloadRate)
            .toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }),

        displayName: "Download rate",
        shortName: "Download %"
    },
    "FAVORITE_RATE": {
        sorter: (a, b) => b.favoriteRate - a.favoriteRate,
        getStat: (u) => u.favoriteRate,
        formatStat: (val) => (val.favoriteRate)
            .toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }),

        displayName: "Favorite rate",
        shortName: "Favorite %"
    },
    "UPSCALE_RATE": {
        sorter: (a, b) => b.upscaleRate - a.upscaleRate,
        getStat: (u) => u.upscaleRate,
        formatStat: (val) => (val.upscaleRate)
            .toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }),

        displayName: "Upscale rate",
        shortName: "Upscale %"
    }
}

export default function StatisticSelector(props: {
    statistic: Statistic
    setStatistic: (val: Statistic) => void
    disabled?: boolean
    /**
     * If true, we won't show the deleted count option. This is for keywords, which we don't track a delete count
     */
    suppressDeletedOption?: boolean
}) {
    const { setStatistic, statistic, disabled } = props

    return <FormControl fullWidth>
        <InputLabel>Statistic</InputLabel>
        <Select
            value={statistic}
            label="Statistic"
            onChange={(e) => setStatistic(e.target.value as Statistic)}
            disabled={disabled}
        >
            {Object.keys(StatisticOptions).map((a) =>
                props.suppressDeletedOption && a === "DELETED" ? null :
                    <MenuItem key={a} value={a}>{StatisticOptions[a as Statistic].displayName ?? a}</MenuItem>
            )}
        </Select>
    </FormControl>

}