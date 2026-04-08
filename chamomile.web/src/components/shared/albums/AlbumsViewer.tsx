import useUserAgent from "../../hooks/useUserAgent";
import { Album } from "../../../model/Album";
import AlbumTile from "./AlbumTile";
import AlbumEditor from "./AlbumEditor";
import { useEffect, useMemo, useState } from "react";
import { Button, IconButton, InputAdornment, TextField, Tooltip } from "@mui/material";
import { Add, ChevronLeft, ChevronRight, Search } from "@mui/icons-material";
import { useAlbums } from "../../hooks/useAlbums";


export default function AlbumsViewer({ onClick, disableNew, hideAlbums }: {
    onClick: (val: Album | undefined) => void
    disableNew?: boolean
    hideAlbums?: number[]
}) {

    const { albums, loading, refresh: refreshAlbums } = useAlbums();
    const [query, setQuery] = useState("")
    const { isMobile } = useUserAgent();
    const [newOpen, setNewOpen] = useState(false)

    const [page, setPage] = useState(0)
    const pageSize = 18;

    useEffect(() => {
        setPage(0)
    }, [query, albums])

    const filteredAlbums = useMemo(() => {
        if (!albums) return [];
        return albums
            .filter(a => !hideAlbums?.includes(a.id ?? -1))
            .filter(a => query.trim().length === 0 || (
                a.name.toLowerCase().includes(query.toLowerCase()) || a.searchQuery.toLowerCase().includes(query.toLowerCase())
            ));
    }, [albums, query])

    const pages = useMemo(() => {
        if (!filteredAlbums) return 0;
        return Math.ceil(filteredAlbums.length / pageSize)
    }, [filteredAlbums])

    const displayAlbums = useMemo(() => {
        return filteredAlbums.slice(page * pageSize, (page + 1) * pageSize);
    }, [filteredAlbums, page]);

    return <div style={{ paddingTop: "20px", height: "100%", display: 'flex', flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: 'center' }}>
            <div>
                <Tooltip title="Create a new collection">
                    <Button
                        onClick={() => { setNewOpen(true); }}
                        color="primary" variant="outlined" sx={{ minWidth: 0, padding: "14px;" }}
                    >
                        <Add />
                    </Button>
                </Tooltip>
            </div>
            <TextField
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search collections"
                slotProps={{
                    input: {
                        startAdornment: <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    }
                }} style={{ flex: "1" }} />
            <div style={{ display: 'flex', gap: "8px", alignItems: 'center' }}>
                <IconButton disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft />
                </IconButton>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: "32px" }}>{pages === 0 ? 0 : page + 1} / {pages}</div>
                <IconButton disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight />
                </IconButton>
            </div>
        </div>
        <div style={{ flex: "1", overflow: "auto" }}>
            {loading ?
                <div style={{ display: 'flex', flexDirection: 'column', height: "100%", justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/brewing.gif" style={{ width: "128px", margin: "16px" }} />
                    <div>Checking the cupboard...</div>
                </div>
                : (displayAlbums?.length ?? 0) === 0 ? <div style={{ display: 'flex', flexDirection: 'column', height: "100%", justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/colorcollection-crop.png" style={{ width: "128px", margin: "16px" }} />
                    <div>No collections found!</div>
                </div> : <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '192' : '256'}px, 1fr))`,
                    gap: '20px',
                }}>
                    {displayAlbums?.map(a =>
                        <AlbumTile key={`album-${a.id}`} album={a} onClick={() => onClick(a)} />
                    )}
                </div>}
        </div>

        <AlbumEditor open={newOpen} setOpen={(val, result) => {
            setNewOpen(val);
            if (result && !disableNew) onClick(result)
            else refreshAlbums();
        }} />
    </div>

}