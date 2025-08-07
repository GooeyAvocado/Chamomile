import { Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, Tooltip } from "@mui/material"
import { useEffect, useState } from "react"
import TabbedModal from "../modals/TabbedModal/TabbedModal"
import TabbedModalTitle from "../modals/TabbedModal/TabbedModalTitle"
import TabbedModalActions from "../modals/TabbedModal/TabbedModalActions"
import TabbedModalTabContent from "../modals/TabbedModal/TabbedModalTabContent"
import { FilterOptions } from "../../../model/FilterOptions"
import useApi from "../../hooks/useApi"
import { getLoraUsage, getLoraUsageDated } from "../../../api/Loras"
import { getModelUsage, getModelUsageDated } from "../../../api/Model"
import TabbedModalConsistentContent from "../modals/TabbedModal/TabbedModalConsistentContent"
import { useWindowDimensions } from "../../hooks/useWindowDimensions"
import AvailabilitySelector from "../model/availabilitySelector/AvailabilitySelector"
import { useModels } from "../../hooks/useModels"
import { useLoras } from "../../hooks/useLoras"
import { getKeywordUsage, getKeywordUsageDated } from "../../../api/Images"
import { StatsPanel } from "./subcomponents/StatsPanel"
import ModelTypePill from "../model/ModelType/ModelTypePill"

export default function StatisticsModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void
    filter: FilterOptions
}) {

    const { open, setOpen, filter } = props
    const [limit, setLimit] = useState(-1)
    const [availability, setAvailability] = useState<0 | 1 | -1>(0);
    const [filterDirty, setFilterDirty] = useState(false)

    const { width } = useWindowDimensions();
    const { models } = useModels();
    const { loras } = useLoras();
    const stacked = width < 450

    const modelAvailable = (val: string) => models?.find(a => a.title === val)?.isAvailable
    const loraAvailable = (val: string) => val === "None" || loras?.find(a => a.alias === val)?.isAvailable

    const { data: loraData, fetch: fetchLoraUsage, loading: loraLoading } = useApi(getLoraUsage)
    const { data: modelData, fetch: fetchModelUsage, loading: modelLoading } = useApi(getModelUsage)
    const { data: keywordData, fetch: fetchKeywordUsage, loading: keywordLoading } = useApi(getKeywordUsage)

    const refreshData = () => {


        setFilterDirty(false)

        fetchLoraUsage(undefined, undefined, { ...filter, lastImage: limit } as FilterOptions)

        fetchModelUsage(undefined, undefined, { ...filter, lastImage: limit } as FilterOptions)

        fetchKeywordUsage(undefined, undefined, { ...filter, lastImage: limit } as FilterOptions)
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

    const LoadingSpinner = (props: { text: string }) => <div style={{ flex: "1", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: "100%", gap: "30px" }}>
        <CircularProgress />
        <div>{props.text}</div>
    </div>

    return <TabbedModal
        open={open} setOpen={setOpen}
        fullWidth maxWidth="md" titleTabStack={stacked}
        tabContentStyle={{ height: "60vh", display: 'flex', flexDirection: 'column', overflowY: 'auto', backgroundColor: "#222", padding: "10px" }}
    >
        <TabbedModalTitle>Usage Statistics</TabbedModalTitle>
        <TabbedModalConsistentContent position="top" style={{ display: 'flex', gap: '10px', marginBottom: '10px', marginTop: '5px' }}>
            <AvailabilitySelector availability={availability} setAvailability={setAvailability} />
            <FormControl fullWidth>
                <InputLabel>Limit</InputLabel>
                <Select
                    value={limit}
                    label="Limit"
                    onChange={(e) => setLimit(e.target.value as number)}
                >
                    <MenuItem value={-1}>All Images</MenuItem>
                    <MenuItem value={100}>Last 100 Images</MenuItem>
                    <MenuItem value={200}>Last 200 Images</MenuItem>
                    <MenuItem value={500}>Last 500 Images</MenuItem>
                    <MenuItem value={1000}>Last 1000 Images</MenuItem>
                    <MenuItem value={2000}>Last 2000 Images</MenuItem>
                    <MenuItem value={5000}>Last 5000 Images</MenuItem>
                    <MenuItem value={10000}>Last 10000 Images</MenuItem>
                </Select>
            </FormControl>
        </TabbedModalConsistentContent>
        <TabbedModalTabContent label="Models">
            {open ? (modelLoading || !modelData) ? <LoadingSpinner text="Loading model usage information" /> : <StatsPanel
                datedUsageApi={getModelUsageDated} minAutoCompleteLength={0}
                usage={availability === 0 ? modelData : availability === 1
                    ? modelData?.filter(a => modelAvailable(a.keyword))
                    : modelData?.filter(a => !modelAvailable(a.keyword))}
                filter={filter} keywordColumnOverride="Model" limit={limit}
                getSampleImageId={(u) => models?.find(a => a.title === u.keyword)?.bannerImage}
                renderKeywordRow={(u) => {
                    const m = models?.find(a => a.title === u.keyword) ?? {
                        name: u.keyword, title: u.keyword, isAvailable: false, type: ""
                    }
                    return <div style={{ color: m.isAvailable ? "white" : "#DDD", fontSize: ".8em" }}>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            {m?.type?.length > 0 && <ModelTypePill type={m?.type} style={{ flexShrink: "0" }} />}
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-end' }}>
                                <b>{m.name}</b>
                            </div>
                        </div>
                        <div style={{ fontSize: ".8em" }}>{`${m.title}${m.isAvailable ? "" : " (Unavailable)"}`}</div>
                    </div>
                }}
            /> : ""}
        </TabbedModalTabContent>
        <TabbedModalTabContent label="LoRAs">
            {open ? (loraLoading || !loraData) ? <LoadingSpinner text="Loading LoRA usage information" /> : <StatsPanel
                datedUsageApi={getLoraUsageDated} minAutoCompleteLength={0}
                usage={availability === 0 ? loraData : availability === 1
                    ? loraData?.filter(a => loraAvailable(a.keyword))
                    : loraData?.filter(a => !loraAvailable(a.keyword))}
                filter={filter} keywordColumnOverride="LoRA" limit={limit}
                getSampleImageId={(u) => loras?.find(a => a.alias === u.keyword)?.bannerImage}
                renderKeywordRow={(u) => {
                    const m = loras?.find(a => a.alias === u.keyword) ?? {
                        name: u.keyword, alias: u.keyword, isAvailable: false, type: ""
                    }
                    return <div style={{ color: m.isAvailable ? "white" : "#DDD", fontSize: ".8em" }}>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            {m?.type?.length > 0 && <ModelTypePill type={m?.type} style={{ flexShrink: "0" }} />}
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-end' }}>
                                <b>{m.name}</b>
                            </div>
                        </div>
                        <div style={{ fontSize: ".8em" }}>{`${m.alias}${m.isAvailable ? "" : " (Unavailable)"}`}</div>
                    </div>
                }}
            /> : ""}
        </TabbedModalTabContent>
        <TabbedModalTabContent label="Keywords">
            {open ? (keywordLoading || !keywordData) ? <LoadingSpinner text="Keyword usage information" /> : <>
                <StatsPanel
                    datedUsageApi={getKeywordUsageDated}
                    usage={keywordData}
                    filter={filter} limit={limit}
                    renderCount={(total) => <Tooltip title="'Keywords' are determined by non-LoRA words split by commas, line breaks, or more than two spaces. This detection isn't perfect!">
                        <div style={{ opacity: ".7", fontSize: ".9em" }}> About {total} unique keywords</div>
                    </Tooltip>}
                />
            </> : ""}
        </TabbedModalTabContent>
        <TabbedModalActions><Button onClick={() => setOpen(false)}>OK</Button></TabbedModalActions>
    </TabbedModal>

}