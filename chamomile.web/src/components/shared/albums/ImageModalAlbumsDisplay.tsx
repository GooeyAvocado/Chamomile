import { CircularProgress, IconButton, Stack } from "@mui/material"
import { Album } from "../../../model/Album"
import AlbumCard from "./AlbumCard"
import { Add } from "@mui/icons-material"
import { useAlbums } from "../../hooks/useAlbums"
import { useState } from "react"
import AlbumBrowser from "./AlbumBrowser"

export default function ImageModalAlbumsDisplay({ albums, onView, onAdd, onRemove }: {
    albums?: number[]
    onView?: (val: Album) => void
    onAdd?: (val: Album) => void
    onRemove?: (val: Album) => void
}) {

    const { loading } = useAlbums();
    const [add, setAdd] = useState(false)

    return <>
        <div style={{ marginTop: "20px", display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: "16px", alignItems: 'center' }}>
                <b>Collections</b>
                {loading && <CircularProgress size={16} />}
            </div>
            {onAdd && <IconButton size="small" disabled={loading} onClick={() => setAdd(true)}><Add /></IconButton>}
        </div>

        {onAdd && <AlbumBrowser
            open={add} setOpen={setAdd} albums={albums ?? []}
            onSelect={(val) => val ? onAdd(val) : console.error("Browser somehow responded with nothing", val)}
        />}

        {!loading && albums && <>{albums.length === 0
            ? <div style={{ fontSize: ".8em" }}>This brew is not in any collections</div>
            : <Stack gap={"5px"}>
                {albums?.map(a => <AlbumCard album={a} onRemove={onRemove} onView={onView} />)}
            </Stack>}</>
        }

    </>
}