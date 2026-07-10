import { CancelPresentation, Collections, Delete as DeleteIcon, Deselect, SelectAll } from "@mui/icons-material"
import { Card, IconButton, Tooltip } from "@mui/material"
import { useState } from "react"
import AreYouSureModal from "../modals/AreYouSureModal"
import useApi from "../../hooks/useApi"
import { deleteMultiImage } from "../../../api/Images"
import { updateMultiImageAlbums } from "../../../api/Albums"
import { useSnackbar } from "notistack"
import ImageAlbumRequest from "../../../model/ImageAlbumRequest"
import AlbumBrowser from "../albums/AlbumBrowser"
import { useAlbums } from "../../hooks/useAlbums"

export default function SelectedImageActions({
    selectedImageIds, onClearSelect, albumId, onDelete, onAddToAlbum, onSelectAll
}: {
    selectedImageIds: number[]
    onClearSelect: () => void
    onSelectAll: () => void
    onDelete: () => void,
    onAddToAlbum: (val: number) => void
    albumId?: number
}) {

    const [mode, setMode] = useState<"DELETE" | "REMOVE_FROM_ALBUM">()
    const [albumSelectorOpen, setAlbumSelectorOpen] = useState(false);

    const { enqueueSnackbar } = useSnackbar()

    const { fetch: deleteImages } = useApi(deleteMultiImage)
    const { fetch: updateImageAlbums } = useApi(updateMultiImageAlbums)
    const { refresh: refreshAlbums } = useAlbums();

    const title = () => {
        switch (mode) {
            case ("DELETE"): return "Delete these images?"
            case ("REMOVE_FROM_ALBUM"): return "Remove all images from this album?"
            default: return ""
        }
    }


    const onYes = () => {
        switch (mode) {
            case "DELETE":
                deleteImages(() => {
                    enqueueSnackbar("Images deleted!", { variant: "success" })
                    onDelete();
                }, () => {
                    enqueueSnackbar("Could not delete images", { variant: "error" })
                }, selectedImageIds)
                break;
            case "REMOVE_FROM_ALBUM":
                updateImageAlbums(() => {
                    enqueueSnackbar("Images removed!", { variant: "success" })
                    refreshAlbums();
                    onDelete();
                }, () => {
                    enqueueSnackbar("Could not remove images", { variant: "error" })
                }, {
                    mode: "REMOVE",
                    albumId: albumId,
                    imageIds: selectedImageIds
                } as ImageAlbumRequest)

        }
    }


    return <Card style={{ display: 'flex', gap: "10px", padding: "5px 10px", marginBottom: '10px', marginTop: "10px", justifyContent: 'space-between' }}>

        <div style={{ display: "flex", gap: "10px", alignItems: 'center' }}>
            <Tooltip title="Deselect all">
                <IconButton onClick={onClearSelect}><Deselect /></IconButton>
            </Tooltip>
            <Tooltip title="Select all">
                <IconButton onClick={onSelectAll}><SelectAll /></IconButton>
            </Tooltip>
            {selectedImageIds.length} image{selectedImageIds.length === 1 ? "" : "s"} selected
        </div>

        <div style={{ display: 'flex', gap: "10px" }}>
            {albumId ? <Tooltip title="Remove all from Collection">
                <IconButton onClick={() => setMode("REMOVE_FROM_ALBUM")}><CancelPresentation /></IconButton>
            </Tooltip> : <Tooltip title="Add all to Collection">
                <IconButton onClick={() => setAlbumSelectorOpen(true)}><Collections /></IconButton>
            </Tooltip>}
            <Tooltip title="Delete all">
                <IconButton onClick={() => setMode("DELETE")}><DeleteIcon /></IconButton>
            </Tooltip>
        </div>

        <AlbumBrowser
            albums={[]}
            onSelect={(val) => {
                updateImageAlbums(() => {
                    enqueueSnackbar("Images added to album!!", { variant: "success" })
                    refreshAlbums();
                    if (val?.hideFromTimeline) onDelete();
                    else onAddToAlbum(val?.id ?? 0)
                }, () => {
                    enqueueSnackbar("Could not add images", { variant: "error" })
                }, {
                    mode: "ADD",
                    albumId: val?.id,
                    imageIds: selectedImageIds
                } as ImageAlbumRequest)
            }}
            open={albumSelectorOpen}
            setOpen={setAlbumSelectorOpen}
        />

        <AreYouSureModal open={!!mode} setOpen={() => setMode(undefined)} onYes={onYes} title={title()}>
            <div>Are you sure you want to do this? </div>
            <div>This will delete {selectedImageIds.length} image(s)</div>
        </AreYouSureModal>

    </Card>
}