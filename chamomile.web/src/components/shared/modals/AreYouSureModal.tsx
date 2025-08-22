import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import { useRef } from "react";

export default function AreYouSureModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void,
    loading?: boolean,
    onYes: () => void,
    title?: string
    children: any
}) {

    const {
        onYes, open, setOpen,
        loading, children, title
    } = props;


    const yesButtonRef = useRef<HTMLButtonElement>(null);
    const focusYes = () => { if (open) yesButtonRef.current?.focus(); }

    return <Dialog
        open={open} onClose={loading ? undefined : () => setOpen(false)}
        fullWidth maxWidth="xs"
        onTransitionEnter={focusYes}
        onTransitionEnd={focusYes} //Do it again so it looks highlighted too
    >

        {title && <DialogTitle>{title}</DialogTitle>}

        <DialogContent>
            {children}
        </DialogContent>

        <DialogActions>
            {loading
                ? <CircularProgress size={32} />
                : <>
                    <Button disabled={loading} onClick={() => setOpen(false)}>No</Button>
                    <Button disabled={loading} onClick={() => onYes()} ref={yesButtonRef}>Yes</Button>
                </>
            }
        </DialogActions>

    </Dialog>

}