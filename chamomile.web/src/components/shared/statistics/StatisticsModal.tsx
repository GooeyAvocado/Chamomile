import { Button, CircularProgress, MenuItem, Select, Tooltip } from "@mui/material"
import { useEffect, useMemo, useState } from "react"
import TabbedModal from "../modals/TabbedModal/TabbedModal"
import TabbedModalTitle from "../modals/TabbedModal/TabbedModalTitle"
import TabbedModalActions from "../modals/TabbedModal/TabbedModalActions"
import TabbedModalTabContent from "../modals/TabbedModal/TabbedModalTabContent"
import { FilterOptions } from "../../../model/FilterOptions"
import useApi from "../../hooks/useApi"
import { getLoraUsage, getLoraUsageDated } from "../../../api/Loras"
import { getCheckpointUsage, getCheckpointUsageDated } from "../../../api/Checkpoint"
import { useWindowDimensions } from "../../hooks/useWindowDimensions"
import AvailabilitySelector from "../model/availabilitySelector/AvailabilitySelector"
import { useCheckpoints } from "../../hooks/useCheckpoints"
import { useLoras } from "../../hooks/useLoras"
import { getGenStats, getGenStatsDated, getKeywordUsage, getKeywordUsageDated } from "../../../api/Images"
import { StatsPanel } from "./subcomponents/StatsPanel"
import GeneralStatsDisplay from "./subcomponents/GeneralStatsDisplay"
import SourceStats from "./subcomponents/SourceStats"
import ModelStatsPanel from "./subcomponents/ModelStatsPanel"
import StatisticSelector, { Statistic, StatisticOptions } from "./subcomponents/StatSelector"

export default function StatisticsModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void
    filter: FilterOptions
}) {

    const { open, setOpen, filter } = props
    const [limit, setLimit] = useState(-1)
    const [availability, setAvailability] = useState<0 | 1 | -1>(0);
    const [filterDirty, setFilterDirty] = useState(false)
    const [stat, setStat] = useState<Statistic>("TOTAL")

    const { width, vertical } = useWindowDimensions();
    const { checkpoints } = useCheckpoints();
    const { loras } = useLoras();
    const stacked = width < 450

    const checkpointAvailable = (val: string) => checkpoints?.find(a => a.id === val)?.isAvailable ?? false
    const loraAvailable = (val: string) => val === "None" || (loras?.find(a => a.id === val)?.isAvailable ?? false)

    const { data: loraData, fetch: fetchLoraUsage, loading: loraLoading } = useApi(getLoraUsage)
    const { data: modelData, fetch: fetchModelUsage, loading: modelLoading } = useApi(getCheckpointUsage)
    const { data: keywordData, fetch: fetchKeywordUsage, loading: keywordLoading } = useApi(getKeywordUsage)
    const { data: generalData, fetch: fetchGeneralData, loading: generalLoading } = useApi(getGenStats)

    const refreshData = () => {
        setFilterDirty(false)
        fetchLoraUsage(undefined, undefined, { ...filter, lastImage: limit } as FilterOptions)
        fetchModelUsage(undefined, undefined, { ...filter, lastImage: limit } as FilterOptions)
        fetchKeywordUsage(undefined, undefined, { ...filter, lastImage: limit } as FilterOptions)
        fetchGeneralData(undefined, undefined, { ...filter, lastImage: limit } as FilterOptions)
    }

    useEffect(() => {
        if (open && (filterDirty || loraData == null || modelData == null)) {
            refreshData();
        }
    }, [open])

    useEffect(() => {
        if (open) refreshData();
    }, [limit])

    useEffect(() => { setFilterDirty(true) }, [filter])

    const sortedModelData = useMemo(() => [...modelData ?? []].sort(StatisticOptions[stat].sorter), [stat, modelData])
    const sortedLoraData = useMemo(() => [...loraData ?? []].sort(StatisticOptions[stat].sorter), [stat, loraData])
    const sortedKeywordData = useMemo(() => [...keywordData ?? []].sort(StatisticOptions[stat].sorter), [stat, keywordData])

    const LoadingSpinner = (props: { text: string }) => <div style={{ flex: "1", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: "100%", gap: "30px" }}>
        <CircularProgress />
        <div>{props.text}</div>
    </div>

    return <TabbedModal
        open={open} setOpen={setOpen}
        fullWidth maxWidth="md" titleTabStack={stacked}
        tabContentStyle={{ height: "70vh", display: 'flex', flexDirection: 'column', overflowY: 'auto', backgroundColor: "#222", padding: "10px" }}
    >
        {!vertical && <TabbedModalTitle>Statistics</TabbedModalTitle>}
        <TabbedModalTabContent label="General">
            {open ? (generalLoading || !generalData) ? <LoadingSpinner text="Loading general statistics" /> : <StatsPanel
                statistic={stat}
                datedUsageApi={getGenStatsDated} usage={[{
                    keyword: "Generated Images", count: 0, minTs: "", maxTs: "", sample: 1,
                    deletedCount: 0, successRate: 0, downloadRate: 0, favoriteRate: 0, upscaleRate: 0,
                    downloadCount: 0, favoriteCount: 0, upscaleCount: 0, totalCount: 0
                }]} filter={filter} limit={limit} hidePagination renderCount={() => <>Show usage graph</>}
            >
                <GeneralStatsDisplay
                    limit={limit}
                    data={generalData}
                    loraData={loraData}
                    modelData={modelData}
                    keywordData={keywordData}
                />

            </StatsPanel> : ""}
        </TabbedModalTabContent>
        <TabbedModalTabContent label="Checkpoints">
            <div style={{ padding: "8px", display: 'flex', gap: "8px" }}>
                <AvailabilitySelector availability={availability} setAvailability={setAvailability} />
                <StatisticSelector statistic={stat} setStatistic={setStat} />
            </div>
            {open ? (modelLoading || !modelData) ? <LoadingSpinner text="Loading checkpoint usage information" /> :
                <ModelStatsPanel
                    availability={availability}
                    data={sortedModelData}
                    filter={filter}
                    getDatedUsageApi={getCheckpointUsageDated}
                    isAvailable={checkpointAvailable}
                    limit={limit}
                    modelType="Checkpoint"
                    models={checkpoints}
                    statistic={stat}
                /> : ""}
        </TabbedModalTabContent>
        <TabbedModalTabContent label="LoRAs">
            <div style={{ padding: "8px", display: 'flex', gap: "8px" }}>
                <AvailabilitySelector availability={availability} setAvailability={setAvailability} />
                <StatisticSelector statistic={stat} setStatistic={setStat} />
            </div>
            {open ? (loraLoading || !loraData) ? <LoadingSpinner text="Loading LoRA usage information" /> : <ModelStatsPanel
                availability={availability}
                data={sortedLoraData}
                filter={filter}
                getDatedUsageApi={getLoraUsageDated}
                isAvailable={loraAvailable}
                limit={limit}
                modelType="LoRA"
                models={loras}
                statistic={stat}
            /> : ""}
        </TabbedModalTabContent>
        <TabbedModalTabContent label="Keywords">
            <div style={{ padding: "8px", display: 'flex', gap: "8px" }}>
                <AvailabilitySelector availability={availability} setAvailability={setAvailability} />
                <StatisticSelector statistic={stat} setStatistic={setStat} />
            </div>
            {open ? (keywordLoading || !keywordData) ? <LoadingSpinner text="Keyword usage information" /> : <>
                {["DELETED", "SUCCESS_RATE"].includes(stat)
                    ? <div style={{
                        flex: "1", display: 'flex', flexDirection: 'column', justifyContent: 'center',
                        alignItems: 'center', width: "100%", gap: "30px"
                    }}
                    >
                        <div style={{ fontSize: "5em" }}>?</div>
                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: "8px" }}>
                            <div style={{ fontWeight: 'bold' }}>This statistic is not available for keywords</div>
                            <div>Please choose another statistic</div>
                        </div>
                    </div>
                    : <StatsPanel
                        datedUsageApi={getKeywordUsageDated}
                        usage={sortedKeywordData} suppressDeleted
                        filter={filter} limit={limit} statistic={stat}
                        renderCount={(total) => <Tooltip title="'Keywords' are determined by non-LoRA words split by commas, line breaks, or more than two spaces. This detection isn't perfect!">
                            <div style={{ opacity: ".7", fontSize: ".9em" }}> About {total} unique keywords</div>
                        </Tooltip>}
                    />}
            </> : ""}
        </TabbedModalTabContent>
        <TabbedModalTabContent label="Sources">
            {open ? (generalLoading || !generalData) ? <LoadingSpinner text="Keyword usage information" /> : <StatsPanel
                datedUsageApi={getGenStatsDated} usage={[]}
                filter={filter} limit={limit} statistic={stat} hidePagination hideGraph
                renderCount={() => <></>}
            >
                <SourceStats data={generalData} />
            </StatsPanel> : ""}
        </TabbedModalTabContent>
        <TabbedModalActions style={{ marginTop: "-8px", marginBottom: "8px", display: 'flex', justifyContent: 'space-between', width: "100%", alignItems: 'center' }}>
            <div style={{ paddingLeft: "24px", marginBottom: "8px", width: "256px" }}>
                <Select
                    value={limit}
                    variant="standard"
                    label="Limit" fullWidth
                    onChange={(e) => setLimit(e.target.value as number)}
                >
                    <MenuItem value={-1}>All</MenuItem>
                    <MenuItem value={100}>Last 100</MenuItem>
                    <MenuItem value={200}>Last 200</MenuItem>
                    <MenuItem value={500}>Last 500</MenuItem>
                    <MenuItem value={1000}>Last 1,000</MenuItem>
                    <MenuItem value={2000}>Last 2,000</MenuItem>
                    <MenuItem value={5000}>Last 5,000</MenuItem>
                    <MenuItem value={10000}>Last 10,000</MenuItem>
                </Select>
            </div>
            <Button onClick={() => setOpen(false)}>OK</Button>

        </TabbedModalActions>
    </TabbedModal>

}