import { Card, IconButton, ListItemIcon, Menu, MenuItem, Typography } from "@mui/material"
import { Album } from "../../../model/Album"
import { useState } from "react"
import { CancelPresentation, Collections, MoreVert } from "@mui/icons-material"
import AlbumThumbImg from "./AlbumThumbImg"
import { useAlbums } from "../../hooks/useAlbums"
import AreYouSureModal from "../modals/AreYouSureModal"

export default function AlbumCard({ album: albumId, onView, onRemove, elevation }: {
    album: number
    onView?: (val: Album) => void
    onRemove?: (val: Album) => void
    elevation?: number
}) {

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { albums } = useAlbums();
    const [ays, setAys] = useState(false)


    const album = albums.find(a => a.id === albumId)


    const handleClose = () => {
        setAnchorEl(null);
    };

    const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        handleClose();
        setAnchorEl(event.currentTarget);
    };

    if (!album) return <></>;

    const CardText = () => <Typography style={{ fontSize: '1em' }}>
        <div style={{ flex: '1', color: "white" }}>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-end' }}>
                    <b>{album.name}</b>
                </div>
            </div>
            <div style={{ fontSize: ".8em" }}>{`${album.count} Image(s)`}</div>
        </div>
    </Typography>


    return <>
        <Card style={{ display: 'flex', alignItems: 'center', overflowX: 'hidden' }} elevation={elevation ?? 3}>

            <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, fontSize: "13.33px" }} >
                <div
                    style={{ display: 'flex', padding: "10px", gap: '20px', alignItems: 'center' }}>
                    <div style={{ width: "64px" }}> <AlbumThumbImg album={album} /> </div>
                    <CardText />
                </div>
            </div>
            {(onView || onRemove) && <div style={{ flexShrink: '0' }}><IconButton onClick={openMenu}><MoreVert /></IconButton></div>}
        </Card>

        {onRemove && <AreYouSureModal open={ays} setOpen={setAys} onYes={() => {
            onRemove?.(album)
        }} title="Remove?">
            Are you sure you want to remove this image from the collection?
        </AreYouSureModal>}

        {(onView || onRemove) && <>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose}>
                {onView && <MenuItem onClick={() => {
                    handleClose();
                    onView?.(album)
                }}>
                    <ListItemIcon><Collections /></ListItemIcon>
                    View collection
                </MenuItem>}
                {onRemove && <MenuItem onClick={() => {
                    handleClose();
                    setAys(true)
                }} >
                    <ListItemIcon><CancelPresentation /></ListItemIcon>
                    Remove from collection
                </MenuItem>}
            </Menu>
        </>}
    </>
}