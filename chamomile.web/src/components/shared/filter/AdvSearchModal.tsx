import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import AdvSearchHelp from "./AdvSearchHelp"

export default function AdvSearchModal(props: {
    open: boolean, onClose: () => void
}) {

    const { open, onClose } = props

    return <Dialog open={open} onClose={onClose}>
        <DialogTitle>Advanced Search</DialogTitle>
        <DialogContent>
            <AdvSearchHelp />
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>OK</Button>
        </DialogActions>
    </Dialog>


}