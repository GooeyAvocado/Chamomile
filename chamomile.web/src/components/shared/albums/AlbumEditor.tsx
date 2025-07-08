import { Button, Card, CircularProgress, Dialog, DialogActions, DialogTitle, Switch, TextField } from "@mui/material"
import { Album } from "../../../model/Album"
import useApi from "../../hooks/useApi"
import { useEffect, useState } from "react"
import AlbumThumbImg from "./AlbumThumbImg"
import { useSnackbar } from "notistack"
import { createAlbum, updateAlbums as updateAlbum } from "../../../api/Albums"
import AlbumCreateRequest from "../../../model/AlbumCreateRequest"

export default function AlbumEditor({
    open, setOpen, album
}: {
    open: boolean
    setOpen: (val: boolean, result?: Album) => void
    album?: Album
}) {

    const [internalAlbum, setInternalAlbum] = useState(album);
    const { enqueueSnackbar } = useSnackbar();
    const [autoAdd, setAutoAdd] = useState(false)
    const [addExisting, setAddExisting] = useState(false)

    useEffect(() => {
        setInternalAlbum(album ?? {
            name: "",
            searchQuery: ""
        })
        setAutoAdd((album?.searchQuery?.length ?? 0) > 0)
        setAddExisting((!album?.id || album?.id <= 0) && (album?.searchQuery?.length ?? 0) > 0)
        updateApi.resetError();
        createApi.resetError();
    }, [open])

    const createApi = useApi(createAlbum)
    const updateApi = useApi(updateAlbum)

    const editing = (internalAlbum?.id ?? 0) > 0
    const loading = createApi.loading || updateApi.loading
    const error = editing ? updateApi.error : createApi.error

    if (!internalAlbum) return;

    const onOk = () => {
        if (editing) {
            updateApi.fetch(onSuccess, onError, { ...internalAlbum, searchQuery: autoAdd ? internalAlbum.searchQuery : "" } as Album)
        } else {
            createApi.fetch(onSuccess, onError, { addExisting: autoAdd && addExisting, name: internalAlbum.name, searchQuery: autoAdd ? internalAlbum.searchQuery : "" } as AlbumCreateRequest)
        }
    }

    const onSuccess = (val?: Album) => {
        enqueueSnackbar(`Collection  ${editing ? "updated" : "created"}!`, { variant: 'success' })
        setOpen(false, val)
    }

    const onError = () => {
        enqueueSnackbar(`Could not ${editing ? "update" : "create"} collection!`, { variant: 'error' })

    }

    return <Dialog open={open} onClose={loading ? undefined : () => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? "Editing" : "Create a"} Collection</DialogTitle>
        <div style={{ display: "flex", gap: "16px", padding: "32px", flexDirection: 'column' }}>
            <Card elevation={10} style={{ height: "128px", maxWidth: "350px", alignSelf: 'center', marginBottom: "32px" }}>
                <AlbumThumbImg album={internalAlbum ?? { firstFourImages: [], name: "", searchQuery: "" }} />
            </Card>
            <TextField label="Name" value={internalAlbum?.name} onChange={(e) => setInternalAlbum({ ...internalAlbum, name: e.target.value })} />
            <div style={{ display: 'flex', gap: "16px", alignItems: 'center' }}>
                <Switch checked={autoAdd} onChange={(_, checked) => setAutoAdd(checked)} />
                <div>
                    <div>Auto Add Images</div>
                    <div style={{ fontSize: ".7em" }}>
                        Specify an Advanced Search below. New images that match this search will automatically be added to the collection
                    </div>

                </div>
            </div>
            {autoAdd && !editing && <div style={{ display: 'flex', gap: "16px", alignItems: 'center' }}>
                <Switch checked={addExisting} onChange={(_, checked) => setAddExisting(checked)} />
                <div>
                    <div>Add Existing Images</div>
                    <div style={{ fontSize: ".7em" }}>
                        Add all images that match this search to this collection. You may want to try it first before executing this!
                    </div>

                </div>
            </div>}
            {autoAdd && <TextField
                error={error?.field === "search"}
                helperText={error?.field === "search" ? error?.message : ""}

                label="Search" value={internalAlbum?.searchQuery}
                onChange={(e) => setInternalAlbum({ ...internalAlbum, searchQuery: e.target.value })}
                slotProps={{
                    htmlInput: {
                        style: { fontSize: '.8em', fontFamily: 'monospace' }
                    }
                }} />}



        </div>

        <DialogActions>
            {loading
                ? <CircularProgress size={32} />
                : <>
                    <Button disabled={loading} onClick={() => setOpen(false)}>Cancel</Button>
                    <Button disabled={loading} onClick={onOk}>OK</Button>
                </>
            }
        </DialogActions>

    </Dialog>

}