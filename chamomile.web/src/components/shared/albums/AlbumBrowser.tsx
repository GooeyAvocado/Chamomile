import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import { Album } from "../../../model/Album"
import AlbumsViewer from "./AlbumsViewer"
import { useWindowDimensions } from "../../hooks/useWindowDimensions"

export default function AlbumBrowser({ albums, open, setOpen, onSelect }: {
    albums: number[]
    open: boolean,
    setOpen: (val: boolean) => void
    onSelect: (val: Album | undefined) => void
}) {

    const { height } = useWindowDimensions();

    return <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>

        <DialogTitle>Add this Image to a Collection</DialogTitle>
        <DialogContent>
            <div style={{ height: height - 200 }}>
                <AlbumsViewer onClick={(val) => {
                    onSelect(val)
                    setOpen(false)
                }} disableNew hideAlbums={albums} />
            </div>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
        </DialogActions>

    </Dialog>
}