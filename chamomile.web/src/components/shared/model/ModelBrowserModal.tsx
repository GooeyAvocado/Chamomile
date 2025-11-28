import { useState } from "react";
import { CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, InputAdornment, TextField, } from "@mui/material";
import { Refresh, Search } from "@mui/icons-material";
import ModelTile from "./ModelTile";
import ImageModalFromId from "../images/ImageModalFromId";
import ModelEditorModal from "./ModelEditorModal";
import { useSnackbar } from "notistack";
import { updateCheckpoint } from "../../../api/Checkpoint";
import useApi from "../../hooks/useApi";
import ModelTypeSelector from "./ModelType/ModelTypeSelector";
import AvailabilitySelector from "./availabilitySelector/AvailabilitySelector";
import { Model, ModelType } from "../../../model/Model";
import { updateLora } from "../../../api/Loras";

export default function ModelBrowserModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void,
    onOk: (val: Model) => void
    onRefresh: (deep?: boolean) => void
    loading?: boolean,
    models?: Model[]
    modelType?: ModelType
    showAny?: boolean
    showAvailability?: boolean
}) {

    const { onOk, open, setOpen, showAny, showAvailability, loading, onRefresh: refresh, models, modelType } = props;

    const [query, setQuery] = useState("")
    const [type, setType] = useState("");
    const [availability, setAvailability] = useState<0 | 1 | -1>(0);

    return <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='xl'>
        <DialogTitle>Select a {modelType}</DialogTitle>
        <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: "75vh" }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <IconButton onClick={() => { refresh(true) }} disabled={loading}>{
                    loading ? <CircularProgress size={24} /> : <Refresh />
                }</IconButton>
                <div style={{ flex: "1" }}>
                    <TextField
                        value={query} onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search" fullWidth
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }}
                    />
                </div>
                <div style={{ width: "200px" }}>
                    <ModelTypeSelector
                        setModelType={(e) => setType(e)}
                        modelType={type}
                        allowAny allowUnknown
                    />
                </div>
                {showAvailability && <div style={{ width: "200px" }}>
                    <AvailabilitySelector availability={availability} setAvailability={setAvailability} />
                </div>}
            </div>
            <div style={{ flex: '1', overflowY: 'auto' }}>
                <GridViewMode
                    data={models} onOk={onOk} query={query} showAny={showAny} type={type} availability={availability}
                    modelType={modelType} refresh={refresh}
                />
            </div>

        </DialogContent>

    </Dialog>

}

function GridViewMode(props: {
    data?: Model[], query: string, onOk: (val: Model) => void, showAny?: boolean, type: string, availability: 0 | 1 | -1,
    modelType?: ModelType, refresh: (deep?: boolean) => void
}) {
    const { data, query, onOk, showAny, type, availability, modelType, refresh } = props

    const [editorModel, setEditorModel] = useState(undefined as Model | undefined)
    const [editorOpen, setEditorOpen] = useState(false)
    const [viewImage, setViewImage] = useState(-1)
    const [imageOpen, setImageOpen] = useState(false)

    const { enqueueSnackbar } = useSnackbar();
    const updateApi = useApi(modelType === "Checkpoint" ? updateCheckpoint : updateLora)

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
        {(showAny
            ? [
                {
                    id: '',
                    bannerImage: undefined,
                    name: 'Any',
                    type: '',
                    description: '',
                    isAvailable: true
                } as Model, ...(
                    (data ?? []).filter(a => {
                        switch (availability) {
                            case 1:
                                return a.isAvailable
                            case -1:
                                return !a.isAvailable
                            default:
                                return true;
                        }
                    })
                )
            ]
            : (data ?? []).filter(a => a.isAvailable)
        )?.filter(a => query.trim().length === 0 ? true : a.name?.toLowerCase().includes(query.toLowerCase()) || a.description?.toLowerCase().includes(query.toLowerCase()))
            .filter(a => type?.trim().length === 0 ? true : type === "?" ? (a?.type ?? "").trim().length === 0 : a.type?.toLowerCase().includes(type?.toLowerCase()))
            .map(a => <div key={a.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
        {editorModel && <ModelEditorModal model={editorModel} open={editorOpen} setOpen={setEditorOpen} onOk={onEditorOk} modelType={modelType} />}
    </div>

}
