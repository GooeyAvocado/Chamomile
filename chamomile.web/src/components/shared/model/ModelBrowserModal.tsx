import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, InputAdornment, TextField, } from "@mui/material";
import { Search } from "@mui/icons-material";
import { Model } from "../../../model/Model";
import { useModels } from "../../hooks/useModels";
import ModelTile from "./ModelTile";
import ImageModalFromId from "../images/ImageModalFromId";
import ModelEditorModal from "./ModelEditorModal";
import { useSnackbar } from "notistack";
import { updateModel } from "../../../api/Model";
import useApi from "../../hooks/useApi";
import ModelTypeSelector from "./ModelType/ModelTypeSelector";

export default function ModelBrowserModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void,
    onOk: (val: Model) => void
    showNone?: boolean
}) {

    const { onOk, open, setOpen, showNone } = props;
    const { models } = useModels();

    const [query, setQuery] = useState("")
    const [type, setType] = useState("");

    return <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='lg'>
        <DialogTitle>Select a Model</DialogTitle>
        <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: "75vh" }}>
            <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{flex:"1"}}>
                <TextField
                    value={query} onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search" fullWidth
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }}
                />
                </div>
                <div style={{width:"200px"}}>
                    <ModelTypeSelector setModelType={(e)=>setType(e)} modelType={type}/>
                </div>
            </div>
            <div style={{ flex: '1', overflowY: 'auto' }}>
                <GridViewMode data={models} onOk={onOk} query={query} showNone={showNone} type={type}/>
            </div>

        </DialogContent>

    </Dialog>

}

function GridViewMode(props: { data: Model[], query: string, onOk: (val: Model) => void, showNone?: boolean, type:string }) {
    const { data, query, onOk, showNone, type } = props

    const [editorModel, setEditorModel] = useState(undefined as Model | undefined)
    const [editorOpen, setEditorOpen] = useState(false)
    const [viewImage, setViewImage] = useState(-1)
    const [imageOpen, setImageOpen] = useState(false)

    const { refresh } = useModels()
    const { enqueueSnackbar } = useSnackbar();
    const updateApi = useApi(updateModel)

    const onEditorOk = (val: Model) => {
        setEditorOpen(false)
        updateApi.fetch(() => {
            refresh()
            enqueueSnackbar("Model updated!", { variant: 'success' })
        }, () => {
            enqueueSnackbar("Error while updating Model", { variant: 'error' })
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
                    title: '',
                    bannerImage: undefined,
                    name: 'All',
                    type : '',
                    description: '',
                } as Model, ...(data ?? [])
            ] 
            : (data ?? []).filter(a => a.isAvailable)
        )?.filter(a => query.trim().length === 0 ? true : a.name?.toLowerCase().includes(query.toLowerCase())  || a.description?.toLowerCase().includes(query.toLowerCase()))
            .filter(a => type?.trim().length === 0 ? true : a.type?.toLowerCase().includes(type?.toLowerCase()))
            .map(a => <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <ModelTile model={a} onClick={() => onOk(a)}
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
        {editorModel && <ModelEditorModal model={editorModel} open={editorOpen} setOpen={setEditorOpen} onOk={onEditorOk}
        />}
    </div>

}
