import { Lora } from "../../../model/Lora";
import { Button, Card, CardActionArea, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { imageUrl } from "../../../api/Images";
import ImageBrowserModal from "../images/ImageBrowserModal";
import ModelTypePill from "../model/ModelType/ModelTypePill";
import ModelTypeSelector from "../model/ModelType/ModelTypeSelector";

export default function LoraEditorModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void
    onOk: (val: Lora) => void,
    lora?: Lora
}) {
    const { lora, onOk, open, setOpen } = props

    const [internalLora, setInternalLora] = useState(lora as Lora)
    const [imageBrowserOpen, setImageBrowserOpen] = useState(false)

    useEffect(() => {
        if (open) {
            setInternalLora(lora as Lora)
        }
    }, [open, lora])

    if (!lora) { return <></> }

    return <Dialog open={open} onClose={() => setOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
            <div>
                <div>{lora.name}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{lora.alias}</div>
            </div>
            {internalLora.type?.length > 0 && <ModelTypePill type={internalLora.type} />}
        </DialogTitle>
        <DialogContent>
            <Card style={{ width: "150px", height: '150px', margin: "0px auto 20px auto" }}><CardActionArea onClick={() => setImageBrowserOpen(true)}>
                <img src={lora?.bannerImage ? imageUrl(lora.bannerImage) : '/outline.png'} style={{ width: '100%', height: '150px', objectFit: 'contain', objectPosition: 'center top' }} />
            </CardActionArea></Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <ModelTypeSelector modelType={internalLora.type} setModelType={(e)=>setInternalLora({ ...internalLora, type: e })}/>
                <TextField
                    label="Notes"
                    value={internalLora.description}
                    onChange={(e) => setInternalLora({ ...internalLora, description: e.target.value })}
                    fullWidth style={{ marginBottom: '0px' }} multiline rows={4} placeholder="What's this lora for?"
                />
                <TextField
                    label="Activation Tags"
                    value={internalLora.samplePrompt}
                    onChange={(e) => setInternalLora({ ...internalLora, samplePrompt: e.target.value })}
                    fullWidth style={{ marginBottom: '0px' }} placeholder="What tags should be used to activate this lora?"
                />
            </div>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => { setOpen(false) }}>Cancel</Button>
            <Button onClick={() => { setOpen(false); onOk(internalLora ?? {} as Lora) }}>OK</Button>
        </DialogActions>

        <ImageBrowserModal open={imageBrowserOpen} setOpen={setImageBrowserOpen} onOk={(a) => {
            setInternalLora({ ...internalLora, bannerImage: a.id })
            setImageBrowserOpen(false)
        }} />
    </Dialog>

}