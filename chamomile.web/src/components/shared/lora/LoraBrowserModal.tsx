import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, InputAdornment, TextField, } from "@mui/material";
import { Search } from "@mui/icons-material";
import { Lora } from "../../../model/Lora";
import { useLoras } from "../../hooks/useLoras";
import LoraTile from "./LoraTile";
import ImageModalFromId from "../images/ImageModalFromId";
import LoraEditorModal from "./LoraEditorModal";
import { updateLora } from "../../../api/Loras";
import useApi from "../../hooks/useApi";
import { useSnackbar } from "notistack";
import ModelTypeSelector from "../model/ModelType/ModelTypeSelector";
import AvailabilitySelector from "../model/availabilitySelector/AvailabilitySelector";

export default function LoraBrowserModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void,
    onOk: (val: Lora) => void,
    showNone?: boolean
}) {

    const { onOk, open, setOpen, showNone } = props;
    const { loras } = useLoras();

    const [query, setQuery] = useState("")
    const [type, setType] = useState("");
    const [availability, setAvailability] = useState<0 | 1 | -1>(0);


    return <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='lg'>
        <DialogTitle>Select a LoRA</DialogTitle>
        <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: "75vh" }}>
            <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: "1" }}>
                    <TextField
                        value={query} onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search" fullWidth
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }}
                    />
                </div>
                <div style={{ width: "200px" }}>
                    <ModelTypeSelector setModelType={(e) => setType(e)} modelType={type} />
                </div>
                {showNone && <div style={{ width: "200px" }}>
                    <AvailabilitySelector availability={availability} setAvailability={setAvailability} />
                </div>}
            </div>
            <div style={{ flex: '1', overflowY: 'auto' }}>
                <GridViewMode data={loras} onOk={onOk} query={query} showNone={showNone} type={type} availability={availability} />
            </div>

        </DialogContent>

    </Dialog>

}

function GridViewMode(props: { data: Lora[], query: string, onOk: (val: Lora) => void, showNone?: boolean, type: string, availability: 0 | 1 | -1 }) {
    const { data, query, onOk, showNone, type, availability } = props

    const [editorModel, setEditorModel] = useState(undefined as Lora | undefined)
    const [editorOpen, setEditorOpen] = useState(false)
    const [viewImage, setViewImage] = useState(-1)
    const [imageOpen, setImageOpen] = useState(false)

    const { refresh } = useLoras()
    const { enqueueSnackbar } = useSnackbar();
    const updateApi = useApi(updateLora)

    const onEditorOk = (val: Lora) => {
        setEditorOpen(false)
        updateApi.fetch(() => {
            refresh()
            enqueueSnackbar("Lora updated!", { variant: 'success' })
        }, () => {
            enqueueSnackbar("Error while updating Lora", { variant: 'error' })
        }, val)
    }

    return <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${'128'}px, 1fr))`,
        gap: '20px'
    }}>
        {(showNone
            ? [
                {
                    alias: '',
                    bannerImage: undefined,
                    name: 'Any',
                    type: '',
                    description: '',
                    samplePrompt: '',
                } as Lora,
                ...(data ?? []).filter(a => {
                    switch (availability) {
                        case 1:
                            return a.isAvailable
                        case -1:
                            return !a.isAvailable
                        default:
                            return true;
                    }
                })
            ]
            : (data ?? []).filter(a => a.isAvailable)
        )?.filter(a => query.trim().length === 0 ? true : a.name.toLowerCase().includes(query.toLowerCase()) || a.description?.toLowerCase().includes(query.toLowerCase()) || a.samplePrompt?.toLowerCase().includes(query.toLowerCase()))
            .filter(a => type?.trim().length === 0 ? true : a.type?.toLowerCase().includes(type?.toLowerCase()))
            .map(a => <div key={a.alias} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <LoraTile lora={a} onClick={() => onOk(a)}
                    onViewImage={() => {
                        setViewImage(a.bannerImage ?? -1)
                        setImageOpen(true)
                    }}
                    onEdit={() => {
                        setEditorModel(a)
                        setEditorOpen(true)
                    }}
                />
            </div>)}

        {viewImage > 0 && <ImageModalFromId open={imageOpen} setOpen={setImageOpen} image={viewImage} />}
        {editorModel && <LoraEditorModal lora={editorModel} open={editorOpen} setOpen={setEditorOpen} onOk={onEditorOk}
        />}
    </div>

}
