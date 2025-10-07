import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import ChamomileLogo from "../ChamomileLogo"
import Markdown from "react-markdown"
import { useEffect } from "react"
import { useSettings } from "../../hooks/useSettings"

export const CHAMOMILE_MAJOR_VERSION = 3.1

export default function WhatsNew({ open, setOpen }: {
    open: boolean,
    setOpen: (val: boolean) => void
}) {

    const frontendBuild = import.meta.env.VITE_BACKEND_BUILD ?? "local"
    const buildTime = import.meta.env.VITE_BUILD_TIMESTAMP ? new Date(import.meta.env.VITE_BUILD_TIMESTAMP) : new Date();


    const whatsnew = `Minor fixes and a few additional things :3

### What's new?
- Refresh button to refresh both Checkpoints and LoRAs on the prompt selector
- Average generation time statistic


### What's changed?
- Grid Editor can now only be closed by the cancel button like the preview dialog
- Prompt sample cleared if the prompt box is emptied

### Fixed bugs
- None
`

    const { settings } = useSettings();

    useEffect(() => {
        if (open && settings.enableSound) {
            new Audio("/sounds/wnew.mp3").play()
        }
    }, [open])

    return <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle><ChamomileLogo wordsOverride={`Welcome to Chamomile ${CHAMOMILE_MAJOR_VERSION.toFixed(1)}`} /></DialogTitle>
        <DialogContent>
            <Markdown>{whatsnew}</Markdown>
        </DialogContent>
        <DialogActions>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ marginTop: "10px", fontFamily: 'monospace', fontSize: '.8em', color: "#5F5F5F", position: "absolute", left: "14px", bottom: "14px" }}>
                    <div>{frontendBuild} Built on {buildTime.toLocaleDateString()}</div>
                </div>
                <Button onClick={() => setOpen(false)}>OK</Button>
            </div>
        </DialogActions>
    </Dialog>

}