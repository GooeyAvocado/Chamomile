import { useEffect, useState } from "react"
import { Prompt } from "../../../model/Prompt"
import { Button, Card, CardActionArea, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import PromptBuilder from "./PromptBuilder";
import { imageUrl } from "../../../api/Images";
import ImageBrowserModal from "../images/ImageBrowserModal";
import { Progress } from "../../../model/Automatic1111/Progress";

export default function PromptEditorModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void
    prompt: Prompt,
    onOk: (val: Prompt) => void
    title?: string
    preview?: boolean
    cancelable?:boolean
    progress?: Progress
}) {

    const { open, setOpen, onOk, prompt, title, preview , cancelable, progress} = props;
    const [internalPrompt, setInternalPrompt] = useState({} as Prompt)
    const [imageBrowserOpen, setImageBrowserOpen] = useState(false)

    useEffect(() => {
        if (open) { setInternalPrompt(prompt) }
    }, [open])

    return <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>{title ?? 'Save Recipe'}</DialogTitle>
        <DialogContent>
            {progress && <>
                <Card style={{ width: "256px", height: '256px', margin: "0px auto 20px auto" }}>
                    <img src={progress.current_image ? "data:image/png;base64," + progress?.current_image : '/outline.png'} style={{ width: '100%', height: '256px', objectFit: 'contain', objectPosition: 'center top' }} />
                </Card>
            </>}
            {!preview && <>
                <Card style={{ width: "150px", height: '150px', margin: "0px auto 20px auto" }}><CardActionArea onClick={() => setImageBrowserOpen(true)}>
                    <img src={internalPrompt.sampleImage ? imageUrl(internalPrompt.sampleImage) : '/outline.png'} style={{ width: '100%', height: '150px', objectFit: 'contain', objectPosition: 'center top' }} />
                </CardActionArea></Card>
                <TextField value={internalPrompt.name} onChange={(e) => setInternalPrompt({ ...internalPrompt, name: e.target.value })} placeholder="Name " fullWidth style={{ marginBottom: '20px' }} />
            </>}
            <PromptBuilder prompt={internalPrompt} setPrompt={setInternalPrompt} alwaysExpand noBrew preview={preview}/>
        </DialogContent>

        <DialogActions>
           {cancelable ? <>
            <div style={{textAlign:'center', width:'100%', marginBottom:'10px'}}><Button variant="contained" onClick={()=>{onOk(internalPrompt)}}>Cacnel</Button></div>
           </> : preview ? <></> : <>
            <Button onClick={() => { setOpen(false) }}>Cancel</Button>
            <Button onClick={() => { setOpen(false); onOk(internalPrompt) }}>OK</Button>
           </>}
        </DialogActions>

        {!preview && <ImageBrowserModal open={imageBrowserOpen} setOpen={setImageBrowserOpen} onOk={(a) => {
            setInternalPrompt({ ...internalPrompt, sampleImage: a.id })
            setImageBrowserOpen(false)
        }} />}

    </Dialog>

}