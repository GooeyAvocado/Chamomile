import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"

export default function AreYouSureModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void,
    loading?: boolean,
    onYes: () => void,
    title?: string
    children: any
}) {

    const { onYes, open, setOpen, loading, children, title } = props;

    return <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">

        {title && <DialogTitle>{title}</DialogTitle>}

        <DialogContent>
            {children}
        </DialogContent>

        <DialogActions>
            {loading
                ? <CircularProgress size={32} />
                : <>
                    <Button disabled={loading} onClick={() => setOpen(false)}>No</Button>
                    <Button disabled={loading} onClick={() => onYes()}>Yes</Button>
                </>
            }
        </DialogActions>

    </Dialog>

}