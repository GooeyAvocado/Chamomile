import { Button, CircularProgress, FormControl, InputLabel, MenuItem, Select } from "@mui/material"
import { ReactNode, useEffect, useState } from "react"
import TabbedModal from "../modals/TabbedModal/TabbedModal"
import TabbedModalTitle from "../modals/TabbedModal/TabbedModalTitle"
import TabbedModalActions from "../modals/TabbedModal/TabbedModalActions"
import TabbedModalTabContent from "../modals/TabbedModal/TabbedModalTabContent"
import { FilterOptions } from "../../../model/FilterOptions"
import useApi from "../../hooks/useApi"
import { getLoraUsage } from "../../../api/Loras"
import { getModelUsage } from "../../../api/Model"
import Usage from "../../../model/Usage"
import ModelCard from "../model/ModelCard"
import TabbedModalConsistentContent from "../modals/TabbedModal/TabbedModalConsistentContent"
import { useWindowDimensions } from "../../hooks/useWindowDimensions"
import LoraCard from "../lora/LoraCard"
import AvailabilitySelector from "../model/availabilitySelector/AvailabilitySelector"
import { useModels } from "../../hooks/useModels"
import { useLoras } from "../../hooks/useLoras"

export default function StatisticsModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void
    filter: FilterOptions
    filterEmpty?: boolean
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
    const loraAvailable = (val: string) => val==="None" || loras?.find(a => a.alias === val)?.isAvailable

    const { data: loraData, fetch: fetchLoraUsage, loading: loraLoading } = useApi(getLoraUsage)
    const { data: modelData, fetch: fetchModelUsage, loading: modelLoading } = useApi(getModelUsage)

    const refreshData = () => {
        fetchLoraUsage(() => {
            setFilterDirty(false)
        }, undefined, {...filter, lastImage:limit} as FilterOptions)

        fetchModelUsage(() => {
            setFilterDirty(false)
        }, undefined, {...filter, lastImage:limit} as FilterOptions)
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
        <TabbedModalConsistentContent position="top" style={{ display: 'flex', gap: '10px', marginBottom:'10px', marginTop:'5px' }}>
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
            {open && modelLoading ? <LoadingSpinner text="Loading model usage information" /> : <ModelUsageBarGraph usage={availability=== 0 
                ? modelData 
                : availability === 1 
                    ? modelData.filter(a=>modelAvailable(a.name)) 
                    : modelData.filter(a=>!modelAvailable(a.name))} />}
        </TabbedModalTabContent>
        <TabbedModalTabContent label="LoRAs">
            {open && loraLoading ? <LoadingSpinner text="Loading LoRA usage information" /> : <LoraUsageBarGraph usage={availability=== 0 
                ? loraData 
                : availability === 1 
                    ? loraData.filter(a=>loraAvailable(a.name)) 
                    : loraData.filter(a=>!loraAvailable(a.name))} />}
        </TabbedModalTabContent>
        <TabbedModalActions><Button onClick={() => setOpen(false)}>OK</Button></TabbedModalActions>
    </TabbedModal>

}

function ModelUsageBarGraph(props: { usage: Usage[] }) {
    return <UsageBarGraph usage={props.usage} cardComponent={(props) => <ModelCard modelTitle={props.name} tiny={props.vertical} />} />
}

function LoraUsageBarGraph(props: { usage: Usage[] }) {
    return <UsageBarGraph usage={props.usage} cardComponent={(props) => <LoraCard loraAlias={props.name} tiny={props.vertical} />} />
}

function UsageBarGraph(props: {
    usage: Usage[]
    cardComponent: (props: { name: string, vertical: boolean }) => ReactNode
}) {

    const { usage, cardComponent: CardComponent } = props;
    const max = usage?.[0]?.count ?? 0
    const { width } = useWindowDimensions();
    const vertical = width < 750

    if(usage.length===0) return <div style={{flex:'1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:"10px"}}>
        <img src="/outline.png" width={64}/>
        <div>No usage data!</div>
    </div>

    return usage?.map(u => <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ width: vertical ? "52px" : "300px", flexShrink: '0' }}><CardComponent name={u.name} vertical={vertical} /></div>
        <div style={{ flex: '1', paddingRight: "10px", height: '75px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ width: `${(u.count * 100) / max}%`, height: '50%', backgroundColor: "#556677", display: "flex", alignItems: 'center', paddingLeft: '10px' }}>
                {u.count}
            </div>
        </div>
    </div>)

}