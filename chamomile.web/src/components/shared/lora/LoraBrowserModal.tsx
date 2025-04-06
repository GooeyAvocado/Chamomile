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

export default function LoraBrowserModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void,
    onOk: (val: Lora) => void,
    showNone?: boolean
}) {

    const { onOk, open, setOpen, showNone } = props;
    const { loras } = useLoras();

    const [query, setQuery] = useState("")
    const [tempQuery, setTempQuery] = useState("")

    return <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='lg'>
        <DialogTitle>Select a LoRA</DialogTitle>
        <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: "75vh" }}>
            <div style={{ display: 'flex', gap: '10px' }}>
                <TextField
                    value={tempQuery} onChange={(e) => setTempQuery(e.target.value)} onBlur={() => setQuery(tempQuery)}
                    placeholder="Search" fullWidth
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }}
                />

            </div>
            <div style={{ flex: '1', overflowY: 'auto' }}>
                <GridViewMode data={loras} onOk={onOk} query={query} showNone={showNone} />
            </div>

        </DialogContent>

    </Dialog>

}

function GridViewMode(props: { data: Lora[], query: string, onOk: (val: Lora) => void, showNone?: boolean }) {
    const { data, query, onOk, showNone } = props

    const [editorModel, setEditorModel] = useState(undefined as Lora | undefined)
    const [editorOpen, setEditorOpen] = useState(false)
    const [viewImage, setViewImage] = useState(-1)
    const [imageOpen, setImageOpen] = useState(false)

    const { refresh } = useLoras()
    const { enqueueSnackbar } = useSnackbar();
    const updateApi = useApi(updateLora)

    const onEditorOk = (val : Lora) => {
        setEditorOpen(false)
        updateApi.fetch(()=>{
            refresh()
            enqueueSnackbar("Lora updated!", {variant:'success'})
        },()=>{
            enqueueSnackbar("Error while updating Lora", {variant:'error'})
        },val)
    }

    return <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${'128'}px, 1fr))`,
        gap: '20px'
    }}>
        {(showNone ? [{
            alias: '',
            bannerImage: undefined,
            name: 'All'
        } as Lora, ...(data ?? [])] : (data ?? []).filter(a => a.isAvailable))?.filter(a => query.trim().length === 0 ? true : a.name.toLowerCase().includes(query.toLowerCase()))
            .map(a => <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
