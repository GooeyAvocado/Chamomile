import { useEffect, useState } from "react"
import { Prompt } from "../../../model/Prompt"
import { Button, Card, CardActionArea, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import PromptBuilder from "./PromptBuilder";
import { imageUrl } from "../../../api/Images";
import ImageBrowserModal from "../images/ImageBrowserModal";
import { Progress } from "../../../model/Automatic1111/Progress";
import { Folder } from "@mui/icons-material";
import PromptFolderPicker from "./PromptFolderPicker";

export default function PromptEditorModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void
    prompt: Prompt,
    onOk: (val: Prompt) => void
    title?: string
    preview?: boolean
    cancelable?: boolean
    progress?: Progress
    onViewImage?: (id: number) => void
}) {

    const { open, setOpen, onOk, prompt, title, preview, cancelable, progress, onViewImage } = props;
    const [internalPrompt, setInternalPrompt] = useState({} as Prompt)
    const [imageBrowserOpen, setImageBrowserOpen] = useState(false)
    const [folderBrowserOpen, setFolderBrowserOpen] = useState(false)
    const folder = internalPrompt?.name?.includes("/") ? internalPrompt?.name?.split("/").slice(0, -1).join("/") : "Root"
    const name = internalPrompt?.name?.includes("/") ? internalPrompt?.name?.split("/").at(-1) : internalPrompt?.name

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
            {!progress && prompt?.orderData && prompt?.orderData?.sample > 0 && preview && <Card style={{ width: "150px", height: '150px', margin: "0px auto 20px auto" }}>
                <CardActionArea onClick={() => { onViewImage?.(prompt.orderData?.sample ?? 0) }}>
                    <img
                        key={prompt?.orderData?.sample}
                        src={imageUrl(prompt.orderData.sample)}
                        style={{ width: '100%', height: '150px', objectFit: 'contain', objectPosition: 'center top' }}
                    />
                </CardActionArea></Card>
            }
            {!preview && <>
                <Card style={{ width: "150px", height: '150px', margin: "0px auto 20px auto" }}><CardActionArea onClick={() => setImageBrowserOpen(true)}>
                    <img
                        key={internalPrompt.sampleImage}
                        src={internalPrompt.sampleImage ? imageUrl(internalPrompt.sampleImage) : '/outline.png'}
                        style={{ width: '100%', height: '150px', objectFit: 'contain', objectPosition: 'center top' }}
                    />
                </CardActionArea></Card>
                <div style={{ display: 'flex', marginBottom: '10px' }}>
                    <Card>
                        <CardActionArea onClick={() => setFolderBrowserOpen(true)}>
                            <div style={{ padding: "5px", display: 'flex', gap: "5px", alignItems: 'center' }}>
                                <Folder fontSize="inherit" />
                                <div>{folder}</div>
                            </div>
                        </CardActionArea>
                    </Card>
                </div>
                <TextField
                    value={name} onChange={(e) => setInternalPrompt({
                        ...internalPrompt, name:
                            internalPrompt.name ?
                                internalPrompt.name.includes("/")
                                    ? [...internalPrompt.name.split("/").slice(0, -1), e.target.value].join("/")
                                    : e.target.value
                                : e.target.value
                    })} placeholder="Name" fullWidth style={{ marginBottom: '20px' }}
                />
                <PromptFolderPicker
                    folder={folder} open={folderBrowserOpen} setOpen={setFolderBrowserOpen}
                    setFolder={(folder) => setInternalPrompt({
                        ...internalPrompt, name:
                            internalPrompt.name ?
                                internalPrompt.name.includes("/")
                                    ? [folder, internalPrompt.name.split("/").at(-1)].join("/")
                                    : [folder, internalPrompt.name].join("/")
                                : folder + "/"
                    })}
                />
            </>}
            <PromptBuilder prompt={internalPrompt} setPrompt={setInternalPrompt} alwaysExpand noBrew preview={preview} />
        </DialogContent>

        <DialogActions>
            {cancelable ? <>
                <div style={{ textAlign: 'center', width: '100%', marginBottom: '10px' }}><Button variant="contained" onClick={() => { onOk(internalPrompt) }}>Cacnel</Button></div>
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