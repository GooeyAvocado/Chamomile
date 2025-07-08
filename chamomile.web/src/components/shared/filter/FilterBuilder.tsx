import { IconButton, InputAdornment, TextField, Tooltip } from "@mui/material";
import { FilterOptions } from "../../../model/FilterOptions";
import { useEffect, useState } from "react";
import { CalendarMonth, Close, ExpandLess, ExpandMore, LibraryAdd, Refresh, Search, Star, StarBorder } from "@mui/icons-material";
import ModelSelector from "../model/ModelSelector";
import LoraSelector from "../lora/LoraSelector";
import AdvSearchModal from "./AdvSearchModal";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import AlbumEditor from "../albums/AlbumEditor";
import { Album } from "../../../model/Album";

export default function FilterBuilder(props: {
    filter: FilterOptions
    setFilter: (val: FilterOptions) => void
    setAlbum?: (val: Album) => void
}) {

    const { filter, setFilter, setAlbum } = props

    const [query, setQuery] = useState("")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")

    const { vertical } = useWindowDimensions();

    const [expanded, setExpanded] = useState(false)
    const [advSearchOpen, setAdvSearchOpen] = useState(false)
    const [createAlbumOpen, setCreateAlbumOpen] = useState(false)

    useEffect(() => {
        setQuery(filter.query ?? "");
    }, [filter])

    const filterEmpty = filter.favorite === false
        && filter.fromDate === ''
        && filter.toDate === ''
        && filter.lora === ''
        && filter.model === ''
        && filter.query?.trim() === ''

    return <>
        <div style={{ width: "100%", display: 'flex', gap: "20px", marginBottom: "10px", marginTop: "10px", flexWrap: "wrap", justifyContent: 'space-between', alignItems: 'center' }}>
            <TextField value={query} onChange={(e) => { setQuery(e.target.value) }} placeholder="Search"

                multiline={vertical}
                minRows={vertical ? 4 : 1}

                onBlur={() => {
                    if (filter.query?.trim() !== query.trim()) { setFilter({ ...filter, query: query.trim() }) }
                }}
                slotProps={{
                    input: {
                        startAdornment: <InputAdornment position="start">
                            <Tooltip title="Learn about Advanced Search">
                                <IconButton onClick={() => setAdvSearchOpen(true)}><Search /></IconButton>
                            </Tooltip>
                        </InputAdornment>,
                        endAdornment: <InputAdornment position="end">
                            <div style={{ display: 'flex', flexDirection: vertical ? 'column' : undefined }}>
                                {setAlbum && !filterEmpty && (filter.album ?? -1) <= 0 && <Tooltip title="Create collection based on this search">
                                    <IconButton
                                        onClick={() => { setCreateAlbumOpen(true) }}>
                                        <LibraryAdd />
                                    </IconButton>
                                </Tooltip>}
                                {!filterEmpty && <Tooltip title="Clear filter">
                                    <IconButton
                                        onClick={() => { setFilter({ favorite: false, fromDate: "", toDate: "", lora: '', model: '', lastImage: 0, query: '', album: filter.album } as FilterOptions) }}>
                                        <Close />
                                    </IconButton>
                                </Tooltip>}
                                <Tooltip title="More Options">
                                    <IconButton onClick={() => { setExpanded(!expanded) }}>{expanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
                                </Tooltip>
                            </div>
                        </InputAdornment>
                    }
                }}
                style={{ flex: "1", minWidth: '250px' }}
            />

            <div style={{ display: "flex", alignItems: 'center', justifyContent: 'end', flexShrink: "1", gap: "10px", flexDirection: vertical ? 'column' : 'row' }}>

                <Tooltip title={filter.favorite ? "Show all" : "Show Favorites"}>
                    <IconButton onClick={() => setFilter({ ...filter, favorite: !filter?.favorite })}>
                        {filter.favorite ? <Star htmlColor="gold" /> : <StarBorder />}
                    </IconButton>
                </Tooltip>

                <Tooltip title="Refresh">
                    <IconButton onClick={() => setFilter({ ...filter })}>
                        <Refresh />
                    </IconButton>
                </Tooltip>

            </div>

        </div>

        <AdvSearchModal open={advSearchOpen} onClose={() => setAdvSearchOpen(false)} />
        {setAlbum && <AlbumEditor open={createAlbumOpen} setOpen={(val, result) => {
            setCreateAlbumOpen(val)
            if (result) {
                setAlbum(result)
                setFilter({ album: result.id })
            }
        }} album={{ name: "", searchQuery: filter.query ?? "" }} />}

        {expanded && <div style={{ display: "flex", flexWrap: 'wrap', width: '100%', marginBottom: "10px", gap: "20px" }}>

            <TextField type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value) }} placeholder="From Date" label="From Date" onBlur={() => {
                if (filter.fromDate?.trim() !== fromDate.trim()) { setFilter({ ...filter, fromDate: fromDate.trim() }) }
            }}
                slotProps={{
                    input: {
                        startAdornment: <InputAdornment position="start"><CalendarMonth /></InputAdornment>,
                    }
                }}
                style={{ flex: "1", minWidth: '250px' }}
            />

            <TextField type="date" value={toDate} onChange={(e) => { setToDate(e.target.value) }} placeholder="From Date" label="To Date" onBlur={() => {
                if (filter.toDate?.trim() !== toDate.trim()) { setFilter({ ...filter, toDate: toDate.trim() }) }
            }}
                slotProps={{
                    input: {
                        startAdornment: <InputAdornment position="start"><CalendarMonth /></InputAdornment>,
                    }
                }}
                style={{ flex: "1", minWidth: '250px' }}
            />

            <LoraSelector lora={filter.lora ?? ""} setLora={(e) => setFilter({ ...filter, lora: e.alias })} style={{ flex: "1", minWidth: '200px' }} showNone />
            <ModelSelector model={filter.model ?? ""} setModel={(e) => setFilter({ ...filter, model: e.title })} style={{ flex: "1", minWidth: '200px' }} showNone />

        </div>}
    </>
}