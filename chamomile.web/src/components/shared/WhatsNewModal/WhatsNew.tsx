import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import ChamomileLogo from "../ChamomileLogo"
import Markdown from "react-markdown"
import { useEffect } from "react"
import { useSettings } from "../../hooks/useSettings"

export default function WhatsNew({ open, setOpen }: {
    open: boolean,
    setOpen: (val: boolean) => void
}) {

    const frontendBuild = import.meta.env.VITE_BACKEND_BUILD ?? "v3-local"
    const buildTime = import.meta.env.VITE_BUILD_TIMESTAMP ? new Date(import.meta.env.VITE_BUILD_TIMESTAMP) : new Date();

    const majorVersion = 3.0
    const whatsnew = `We added a lot with this one, including this dialog!

### What's new?
- **Promptbox Autocomplete:** You can now get suggestions for LoRAs (<), Wildcards (__), and Dprompts variables ($\{var}) on the prompt box
- **Collections:** It's now a lot easier to organize your images. You can set up collections to automatically add images based on a search, or generate images directly to an album.
- **Settings:** You can now configure sound, defaults, and which values from the prompt box are fixed between orders.
- **Keyword Statistics:** One new statistics category added so you can see what makes up your prompts.
- **LoRA and Wildcard autocomplete:** On your prompt box, you can now auto complete for LoRAs (<) or wildcards (__).
- **Model Sequencing:** Chamomile can now sequence models and switch between them when conducting large numbers of brews.
- **Pause Brewing:** Need to take a break? Don't want to lose your queue? Simply pause generation on the top right of the screen. You can close SD and bring it back up later
- **Image notes:** You can now write some small text notes on images
- **Generation Time Measured:** See how long SD actually took to generate.
- **Download button:** Directly download with your mouse, skipping a right click. You'll also be warned if you've already downloaded an image to keep your folders clean
- **Copy Prompts to Clipboard:** (Requires HTTPS!)
- **Single brew button:** For when you only want a single brew
- CTRL+D override to favorite images when viewing an image

### What's changed?
- **UI Overhaul:** Chamomile is now a little wider, and leaves a bit more vertical space for images
- **Better Sampler Dropdown:** Now with search, sorted, and some common samplers on top with user friendly text
- **Better Statistics:** Statistics have been bolstered with usages over time, making it easier to see insights into your usage patterns.
- **Recipe Folders:** Recipes can now be stored in different folders to make it easier to find them.
- **Order previews:** Lost what you ordered? Don't worry. Now if you re-order prompts, or order a saved recipe, a sample image will show on your queued order.
- **Additional Search Options:** You can now search for images you've upscaled, and images you've downloaded
- **Accordions:** There's a lot of information for each image. We've collapsed some bits of information so you can focus on exactly what you're looking for.
- **Override Import/Export:** A little pair of buttons to import export overrides for later
- **Variables further deprecated:** Variables will only be available if the user adds a variable to the prompt (%myVar%)
- **Order icon changed:** Ordering now uses ReceiptLong instead of Terminal
- Models and LoRAs that are unavailable and have no images generated will automatically delete themselves
- You can now re-check SD status from the app rather than refreshing the page
- Base prompts are now unavailable for images that have base prompts that match actual prompts
- Advanced Prompt options have been re-ordered to wrap in a more sensible way
- Welcome pane has been improved to direct users on how to brew their first image, upload their collection, or get to the help section
- Expand is now smooth on search and prompt box
- Search on Enter QOL improvement


### Fixed bugs
- Fixed bug that would make certain image selectors not show the selected image
- Fixed bug that would make the full page dropzone react to anything, not just images
- Fixed bug that would make Chamomile not display an active job if the page loaded while there was an active job
- Fixed bug that would make "unknown" model types show all models instead
- Fixed bug that would make it impossible to upload images where the base model is unavailable
- Fixed bug that would make cancelling a group of orders fail to completely appear cancelled on the frontend
- Fixed bug that would make statistics for empty results crash the app
- Fixed bug where grouped prompts modal would report steps as 10x what they actually were
- Fixed some typos
- Improved system stability

### Known bugs
- LoRA usage statistics are unavailable if viewing a collection or searching for a specific LoRA
`

    const { settings } = useSettings();

    useEffect(() => {
        if (open && settings.enableSound) {
            new Audio("/sounds/wnew.mp3").play()
        }
    }, [open])

    return <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle><ChamomileLogo wordsOverride={`Welcome to Chamomile ${majorVersion.toFixed(1)}`} /></DialogTitle>
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