import { Card, CardActionArea, Divider, IconButton, Menu, MenuItem, Typography } from "@mui/material"
import { Album } from "../../../model/Album"
import { CSSProperties, useState } from "react"
import { imageUrl } from "../../../api/Images"
import { MoreVert } from "@mui/icons-material"
import AlbumThumbImg from "./AlbumThumbImg"

export default function AlbumCard({ album, onClick, refresh }: {
    album: Album
    onClick: () => void
    refresh: () => void
}) {

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClose = () => {
        setAnchorEl(null);
    };

    const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        handleClose();
        setAnchorEl(event.currentTarget);
    };

    const CardImage = (props: { style?: CSSProperties }) => <div style={{ width: "64px" }}>
        <AlbumThumbImg album={album} />
    </div>

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
        <Card style={{ display: 'flex', alignItems: 'center', overflowX: 'hidden' }} elevation={3}>

            <CardActionArea style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }} >
                <div
                    style={{ display: 'flex', padding: "10px", gap: '20px', alignItems: 'center' }}>
                    <CardImage />
                    <CardText />
                </div>
            </CardActionArea>
            <div style={{ flexShrink: '0' }}><IconButton onClick={openMenu}><MoreVert /></IconButton></div>
        </Card>


        {<>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose}>
                <MenuItem onClick={console.warn}>Edit Model</MenuItem>
                <Divider />
                <MenuItem onClick={console.warn} >View sample image</MenuItem>
                <MenuItem onClick={console.warn} >Set this as sample image</MenuItem>
            </Menu>
        </>}
    </>
}