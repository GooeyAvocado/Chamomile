import { Button, Card, CardActionArea, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { imageUrl } from "../../../api/Images";
import ImageBrowserModal from "../images/ImageBrowserModal";
import ModelTypePill from "./ModelType/ModelTypePill";
import { Model } from "../../../model/Model";
import ModelTypeSelector from "./ModelType/ModelTypeSelector";

export default function ModelEditorModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void
    onOk: (val: Model) => void,
    model?: Model
}) {
    const { model, onOk, open, setOpen } = props

    const [internalModel, setInternalModel] = useState(model as Model)
    const [imageBrowserOpen, setImageBrowserOpen] = useState(false)

    useEffect(() => {
        if (open) {
            setInternalModel(model as Model)
        }
    }, [open, model])

    if (!model) { return <></> }

    return <Dialog open={open} onClose={() => setOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
            <div>
                <div>{model.name}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{model.title}</div>
            </div>
            {internalModel.type?.length > 0 && <ModelTypePill type={internalModel.type} />}
        </DialogTitle>
        <DialogContent>
            <Card style={{ width: "150px", height: '150px', margin: "0px auto 20px auto" }}><CardActionArea onClick={() => setImageBrowserOpen(true)}>
                <img
                    key={internalModel.bannerImage}
                    src={internalModel?.bannerImage ? imageUrl(internalModel.bannerImage) : '/outline.png'}
                    style={{
                        width: '150px', height: '150px',
                        objectFit: 'cover', objectPosition: 'center top'
                    }}
                />
            </CardActionArea></Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <ModelTypeSelector modelType={internalModel.type} setModelType={(e) => setInternalModel({ ...internalModel, type: e })} />
                <TextField
                    label="Notes"
                    value={internalModel.description}
                    onChange={(e) => setInternalModel({ ...internalModel, description: e.target.value })}
                    fullWidth style={{ marginBottom: '0px' }} multiline rows={4} placeholder="What's this model for?"
                />
            </div>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => { setOpen(false) }}>Cancel</Button>
            <Button onClick={() => { setOpen(false); onOk(internalModel ?? {} as Model) }}>OK</Button>
        </DialogActions>

        <ImageBrowserModal open={imageBrowserOpen} setOpen={setImageBrowserOpen} onOk={(a) => {
            setInternalModel({ ...internalModel, bannerImage: a.id })
            setImageBrowserOpen(false)
        }} />
    </Dialog>

}