import useUserAgent from "../../hooks/useUserAgent";
import { Album } from "../../../model/Album";
import AlbumTile from "./AlbumTile";
import NewAlbumTile from "./NewAlbumTile";
import AlbumEditor from "./AlbumEditor";
import { useState } from "react";
import { InputAdornment, TextField } from "@mui/material";
import { Search } from "@mui/icons-material";
import { useAlbums } from "../../hooks/useAlbums";


export default function AlbumsViewer({ onClick, disableNew, hideAlbums }: {
    onClick: (val: Album | undefined) => void
    disableNew?: boolean
    hideAlbums?: number[]
}) {

    const { albums, loading } = useAlbums();
    const [query, setQuery] = useState("")
    const { isMobile } = useUserAgent();
    const [newOpen, setNewOpen] = useState(false)


    const queryLower = query.toLowerCase();
    const results = albums?.filter(a =>
        query.length === 0
            ? true
            : a.name.toLowerCase().includes(queryLower) || a.searchQuery.toLowerCase().includes(queryLower)
    ).filter(a => !hideAlbums?.includes(a.id ?? -1))

    return <div style={{ paddingTop: "20px", height: "100%", display: 'flex', flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", gap: "20px" }}>
            <TextField
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Collections"
                slotProps={{
                    input: {
                        startAdornment: <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    }
                }} style={{ flex: "1" }} />
        </div>
        <div style={{ flex: "1", overflow: "auto" }}>
            {loading ?
                <div style={{ display: 'flex', flexDirection: 'column', height: "100%", justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/brewing.gif" style={{ width: "128px", margin: "16px" }} />
                    <div>Checking the cupboard...</div>
                </div>
                : (results?.length ?? 0) === 0 && query.length > 0 ? <div style={{ display: 'flex', flexDirection: 'column', height: "100%", justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/colorcollection-crop.png" style={{ width: "128px", margin: "16px" }} />
                    <div>No collections found!</div>
                </div> : <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '192' : '256'}px, 1fr))`,
                    gap: '20px',
                }}>
                    {disableNew || query.trim().length === 0 && <NewAlbumTile onClick={() => setNewOpen(true)} />}
                    {results?.map(a =>
                        <AlbumTile key={`album-${a.id}`} album={a} onClick={() => onClick(a)} />
                    )}
                </div>}
        </div>

        <AlbumEditor open={newOpen} setOpen={(val, result) => {
            setNewOpen(val);
            if (result) onClick(result);
        }} />
    </div>

}