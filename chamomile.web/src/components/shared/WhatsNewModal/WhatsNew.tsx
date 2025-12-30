import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import ChamomileLogo from "../ChamomileLogo"
import Markdown from "react-markdown"
import { useEffect } from "react"
import { useSettings } from "../../hooks/useSettings"

export const CHAMOMILE_MAJOR_VERSION = 3.2

export default function WhatsNew({ open, setOpen }: {
    open: boolean,
    setOpen: (val: boolean) => void
}) {

    const frontendBuild = import.meta.env.VITE_BACKEND_BUILD ?? "local"
    const buildTime = import.meta.env.VITE_BUILD_TIMESTAMP ? new Date(import.meta.env.VITE_BUILD_TIMESTAMP) : new Date();


    const whatsnew = `
### What's new?
- **Image binary data moved out:** Please make sure you check out the [migration script](https://github.com/GooeyAvocado/Chamomile/blob/master/Chamomile.Data/DDLs/LargeObjectMigrationScript.sql)
    - This was done for major performance improvements on Chamomile instances with large amounts of images
- **Templates:** Parametrized prompt templates for reusable chunks of prompts. See more in the new help section.
- **Model tags:** Checkpoints and LoRAs now have tags to help organize them better
- **Image tile sizes are now configurable**: You can select from extra small to extra large
- **More like this by date**: Easily see what images you generated around the same time as any given image
- **Infinite scroll**: We now load more as soon as you hit the bottom of the scroll
- **Conflict warning**: Chamomile will now warn if more than one LoRA has the same alias, instead of crashing and not updating the list of LoRAs
- **More keyboard shortcuts**: This includes numpad mappings to allow for one handed operation of Chamomile
- **More context menu options**: Right clicking on an image now allows you to upscale and download images
- Upscale now available from image hotbar and through keyboard shortcut.
- Middle click to re-order saved prompts
- Blurred image background for the image viewer
- Refresh button to refresh both Checkpoints and LoRAs on the prompt selector
- Current image index and total image count is now displayed on the lower right of displayed images
- Average generation time statistic
- Search by no LoRAs
- Clear prompt button

### What's changed?
- **Wildcards and Overrides changed to "Dynamics":** A more general term to include Templates and Template Management
- **Order of operations changed for dynamics:** Templates are applied first, then overrides, then wildcards
- **Cumulative usage graphs:** Graphs are now cumulative instead of just showing daily counts.
    - There's a little switch to change back
- **Date search improvements:** Date search is now from and to inclusive 
    - IE: from is greater or equal to midnight, and to is less than or equal to 23:59:59
- **Upscaler and Scale now saved to settings**: Your selected upscaler and scale are now saved to settings. You can 
- Improved brewing image tile to better highlight the brewing image
- Improved brewing/queued prompt modal
- Image selector improvements:
    - LoRA and Checkpoint editor image selectors now have default filters to show images by default matching the checkpoint or LoRA being edited
    - Image selector has filter expanded by default
    - Image selector no longer shows brewing images
- Grid Editor can now only be closed by the cancel button like the preview dialog
- Backend changes to unify components for Models (Checkpoints and LoRAs) to make future improvements easier
- Improved image loading speeds
- Increased stability by limiting image change speed
- Hid the left and right arrows if we're at the beginning or end of the results respectively 
- Bump backend to .NET 10 from .NET 8

### Fixed bugs
- Fixed bug where re-ordering (not from base) from an image tile did not set the prompt origin
- Fixed bug where favorite-ing from the hotbar didn't work.
- Fixed bug where some image selectors did not center the image
- Fixed bug where "Images Upscaled" was incorrectly labeled "Images Downloaded" on the general statistics pane
- Fixed bug where the filter builder may say it's not empty, even though it is
- Fixed bug where general statistics would fail to load if all images had no generation time
- Fixed bug where upscaling an image and navigating away from that image would re-select the image when upscaling is complete
`

    const { settings } = useSettings();

    useEffect(() => {
        if (open && settings.enableSound) {
            new Audio("/sounds/wnew.mp3").play()
        }
    }, [open])

    return <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
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