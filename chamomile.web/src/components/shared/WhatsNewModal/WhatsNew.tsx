import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import ChamomileLogo from "../ChamomileLogo"
import Markdown from "react-markdown"
import { useEffect } from "react"
import { useSettings } from "../../hooks/useSettings"

export const CHAMOMILE_MAJOR_VERSION = 4.0

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
- **Infinite scroll**: We now load more as soon as you hit the bottom of the scroll
- **Rush and Delay Orders**: You can now rush (make them next in queue) or delay (make them last in queue) orders
    - Brew buttons will now rush orders immediately if \`SHIFT\` clicked
- **Better Statistics**: Statistics now include a count of deleted images, as well as a count of downloaded, upscaled, and favorite images by LoRA, Checkpoint, and keyword.
- **Conflict warning**: Chamomile will now warn if more than one LoRA has the same alias, instead of crashing and not updating the list of LoRAs
- **More like this by date**: Easily see what images you generated around the same time as any given image
- **More keyboard shortcuts**: This includes numpad mappings to allow for one handed operation of Chamomile
- **More context menu options**: Right clicking on an image now allows you to upscale and download images
- **New LoRA Grid axis type**: The Grid Editor will now let you test LoRAs and weights as an axis.
- **Image tile sizes are now configurable**: You can select from extra small to extra large
- **ETA for batch**: The status button now shows an estimated time remaining for the entire batch of images, as well as the current image.
- **Improved Mobile Experience**
    - Prompts and Search now collapse to buttons on the navbar on mobile
    - Grids now have a D-Pad on the top right
- Original non-upscaled copy of images are now visible through a switch in the upscale panel
- Upscale now available from image hotbar and through keyboard shortcut CTRL+U.
- Middle click to re-order saved prompts
- Blurred image background for the image viewer
- Refresh button to refresh both Checkpoints and LoRAs on the prompt selector
- Current image index and total image count is now displayed on the lower right of displayed images
- Average generation time statistic
- Search by no LoRAs
- Clear prompt button

### What's changed?
- **Grid Editor Overhaul:** Grid editor is now a tabbed dialog box to make it a bit more spacious when defining columns
- **Wildcards and Overrides changed to "Dynamics":** A more general term to include Templates and Template Management
- **Order of operations changed for dynamics:** Templates are applied first, then overrides, then wildcards
- **Improved Display page**: Display page now has quick options to modify dynamics, models, or prompt new images
- **Multi-select LoRAs and Checkpoints**: Multi-select is now available for grids axes, LoRAs for prompting, and for Checkpoints when creating checkpoint sequences
- **Recipe browser improvements**: Search now auto-focused on open, search now only looks at recipe names/positive prompt instead of including folder structure in search
- **Cumulative usage graphs:** Graphs are now cumulative instead of just showing daily counts.
    - There's a little switch to change back
- **Date search improvements:** Date search is now from and to inclusive
    - IE: from is greater or equal to midnight, and to is less than or equal to 23:59:59
- **Upscaler and Scale now saved to settings**: Your selected upscaler and scale are now saved to settings.
- **Grids can now be edited after images are generated**: We now allow the following limited edits to a grid after an image is generated:
    - Edit Row/Column value if it is empty
    - Remove last row or column if it is empty
    - Add more rows or columns
- **Grid Labels Reworked**: Grid labels are now smaller and have a tooltip to display their full contents. Row labels are now rotated text to conserve space.
- Images in grids can now be multi-selected to delete. Rows and columns are now selectable by clicking their label.
- Grids and collections are now paginated, and the new grid/new collection button was moved to the left of the search bar instead of a dedicated tile.
- Grids now order by newest first
- Display now switches to latest image only if last latest image is displayed.
- Display's small buffer size has been removed and is now unbounded.
- Image viewer now focuses the last selected image, scrolling to it if necessary.
- Improved brewing image tile to better highlight the brewing image
- Improved brewing/queued prompt modal
- Image selector improvements:
    - LoRA and Checkpoint editor image selectors now have default filters to show images by default matching the checkpoint or LoRA being edited
    - Image selector has filter expanded by default
    - Image selector no longer shows brewing images
- Grid editor can now only be closed by the cancel button like the preview dialog
- Grid individual images can now be cancelled while brewing
- Grid seed is now user editable
- Backend changes to unify components for Models (Checkpoints and LoRAs) to make future improvements easier
- Improved image loading speeds
- Increased stability by limiting image change speed
- Hid the left and right arrows if we're at the beginning or end of the results respectively
- Bump backend to .NET 10 from .NET 8
- Bump to MUI 9
- Bump to NodeJS 26

### Fixed bugs
- Fixed bug that would make the application crash its tab if a menu option was pressed (Thanks MUI)
- Fixed bug which caused grids not to order a cell if it was the current active job for another grid.
- Fixed bug where re-ordering (not from base) from an image tile did not set the prompt origin
- Fixed bug where favorite-ing from the hotbar didn't work.
- Fixed bug where some image selectors did not center the image
- Fixed bug where "Images Upscaled" was incorrectly labeled "Images Downloaded" on the general statistics pane
- Fixed bug where the filter builder may say it's not empty, even though it is
- Fixed bug where general statistics would fail to load if all images had no generation time
- Fixed bug where upscaling an image and navigating away from that image would re-select the image when upscaling is complete
- Fixed bug where loading model sequences would not work (not sure if this is a bug created during development, thought to included it anyways)
- Fixed bug that caused a glitchy preview when an album tile was created for an empty album
- Fixed bug that caused negative prompts with more than one line to be parsed as empty
- Fixed bug that caused grids that were edited after being cleared to lose their re-rolled seed
- Fixed bug that caused the row axis labels on grids to slip away if the grid was too wide
- Fixed bug that caused the confirmation dialog to remain open after clicking yes to remove an image from an album
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