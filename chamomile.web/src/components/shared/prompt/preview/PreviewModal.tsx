import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material"
import PromptBuilder from "../PromptBuilder"
import { usePrompt } from "../../../hooks/usePrompt"
import { useEffect, useState } from "react"
import useApi from "../../../hooks/useApi"
import { previewPrompt } from "../../../../api/Images"
import { Yard } from "@mui/icons-material"

export default function PreviewModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void
}) {

    const { open, setOpen } = props
    const { prompt, setPrompt } = usePrompt();
    const [internalPrompt, setInternalPrompt] = useState(prompt);
    const [cachedImage, setCachedImage] = useState<string | null>(null);

    const previewApi = useApi(previewPrompt);

    useEffect(() => {
        if (open) {
            setInternalPrompt({ ...prompt, seed: prompt.seed === -1 ? Math.floor(Math.random() * 1000000) : prompt.seed, steps: 10 });
        }
    }, [open])

    useEffect(() => {
        if (!open) return; // Don't fetch if the modal is closed
        const timeout = setTimeout(() => {
            previewApi.fetch((val) => { setCachedImage(val?.data ?? null) }, undefined, internalPrompt)
        }, 2000);

        return () => clearTimeout(timeout);
    }, [internalPrompt]);

    return <Dialog open={open} fullWidth maxWidth='md'>
        <DialogTitle>Recipe Preview</DialogTitle>
        <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ flex: '1', aspectRatio: '1', maxWidth: '256px', margin: '0 auto', position: 'relative' }}>
                {previewApi.loading && <div style={{ position: "absolute" }}>
                    <img src="brewing.gif" style={{ width: '100%', opacity: ".5" }} />
                </div>}
                <img src={cachedImage ? "data:image/png;base64," + cachedImage : "brewing.gif"} style={{ width: '100%' }} />
            </div>
            <hr style={{ width: '100%' }} />
            <PromptBuilder fullHeight noBrew prompt={internalPrompt} setPrompt={setInternalPrompt} alwaysExpand />
        </DialogContent>
        <DialogActions style={{ margin: '10px', display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <IconButton onClick={() => { setInternalPrompt({ ...internalPrompt, seed: Math.floor(Math.random() * 1000000) }) }}><Yard style={{ margin: '-7px' }} /></IconButton>
                <div>Seed: {internalPrompt.seed}</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <Button color="secondary" onClick={() => setOpen(false)}>Discard</Button>
                <Button variant="contained" onClick={() => {
                    setOpen(false)
                    setPrompt({ ...internalPrompt, seed: prompt.seed, steps: prompt.steps })
                }}>Use Recipe</Button>
            </div>
        </DialogActions>
    </Dialog>
}