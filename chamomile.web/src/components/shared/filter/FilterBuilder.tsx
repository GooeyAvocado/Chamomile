import { IconButton, InputAdornment, TextField, Tooltip } from "@mui/material";
import { FilterOptions } from "../../../model/FilterOptions";
import { useEffect, useRef, useState } from "react";
import { CalendarMonth, Close, Download, ExpandMore, Gradient, LibraryAdd, Search, Star, StarBorder } from "@mui/icons-material";
import ModelSelector from "../model/ModelSelector";
import LoraSelector from "../lora/LoraSelector";
import AdvSearchModal from "./AdvSearchModal";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import AlbumEditor from "../albums/AlbumEditor";
import { Album } from "../../../model/Album";
import StatsButton from "../StatsButton/StatsButton";
import PromptboxImageSample from "../prompt/preview/PromptboxImageSample";
import { clearFilter } from "../Utils";

export default function FilterBuilder(props: {
    filter: FilterOptions
    setFilter: (val: FilterOptions) => void
    setAlbum?: (val: Album) => void
    alwaysExpanded?: boolean
}) {

    const { filter, setFilter, setAlbum, alwaysExpanded } = props

    const [query, setQuery] = useState("")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")

    const { vertical, width } = useWindowDimensions();

    const expandRef = useRef<HTMLDivElement>(null);
    const [expandedHeight, setExpandedHeight] = useState("0px")
    const [expanded, setExpanded] = useState(alwaysExpanded)
    const [advSearchOpen, setAdvSearchOpen] = useState(false)
    const [createAlbumOpen, setCreateAlbumOpen] = useState(false)

    useEffect(() => {
        setQuery(filter.query ?? "");
        setFromDate(filter.fromDate ?? "")
        setToDate(filter.toDate ?? "")
    }, [filter])

    const filterEmpty = !filter ||
        Object.keys(filter).length === 0 ||
        (
            (filter.favorite ?? false) === false
            && (filter.upscaled ?? false) === false
            && (filter.downloaded ?? false) === false
            && (filter.fromDate ?? "") === ''
            && (filter.toDate ?? "") === ''
            && (filter.lora ?? "") === ''
            && (filter.model ?? "") === ''
            && (filter.query?.trim() ?? "") === ''
            && (filter.sample ?? 0) < 1
        )

    const onBlur = () => {
        if (filter.query?.trim() !== query.trim()) { setFilter({ ...filter, query: query.trim() }) }
    }

    useEffect(() => {
        if (expandRef.current) {
            setExpandedHeight(expanded ? `${expandRef.current.scrollHeight}px` : "0px");
        }
    }, [expanded, width]);

    return <>
        <div style={{ width: "100%", display: 'flex', gap: "10px", flexWrap: "wrap", justifyContent: 'space-between', alignItems: 'center' }}>
            <TextField
                value={query} onChange={(e) => {
                    setQuery(e.target.value)
                }}

                placeholder="Search" multiline={vertical} minRows={vertical ? 4 : 1}
                onBlur={onBlur}
                slotProps={{
                    input: {
                        startAdornment: <InputAdornment position="start">

                            <div style={{ display: "flex", alignSelf: "center", alignItems: 'center' }}>
                                {(((filter.sample ?? -1) > 0)) //if we have an ID (from a saved prompt) or Sample Image (from an existing image)
                                    ? <PromptboxImageSample filter={filter} clearSample={() => { setFilter({ ...filter, sample: -1 }) }} />
                                    : <Tooltip title="Learn about Advanced Search">
                                        <IconButton onClick={() => setAdvSearchOpen(true)}><Search /></IconButton>
                                    </Tooltip>}
                            </div>

                        </InputAdornment>,
                        endAdornment: <InputAdornment position="end">
                            <div style={{ display: 'flex', flexDirection: vertical ? 'column' : undefined }}>
                                {setAlbum && (filter?.query?.length ?? 0) > 0 && (filter.album ?? -1) <= 0 && <Tooltip title="Create collection based on this text query">
                                    <IconButton
                                        onClick={() => { setCreateAlbumOpen(true) }}>
                                        <LibraryAdd />
                                    </IconButton>
                                </Tooltip>}
                                {!filterEmpty && <Tooltip title="Clear filter">
                                    <IconButton
                                        onClick={() => { setFilter(clearFilter(filter)) }}>
                                        <Close />
                                    </IconButton>
                                </Tooltip>}
                                {!alwaysExpanded && <Tooltip title="More Options">
                                    <IconButton onClick={() => { setExpanded?.(!expanded) }}>
                                        <ExpandMore
                                            style={{
                                                transition: "transform 0.2s ease",
                                                transform: expanded ? "rotate(180deg)" : "rotate(0deg)"
                                            }}
                                        />
                                    </IconButton>
                                </Tooltip>}
                            </div>
                        </InputAdornment>
                    }
                }}
                style={{ flex: "1" }}
                onKeyUp={(e) => { if (e.key === "Enter") onBlur() }}
            />

            <div style={{
                display: "flex", alignItems: 'center', justifyContent: 'center',
                flexShrink: "1", gap: "10px", flexDirection: vertical ? 'column' : 'row',
                width: vertical ? undefined : "120px"
            }}>

                <Tooltip title={filter.favorite ? "Show all" : "Show Favorites"}>
                    <IconButton onClick={() => setFilter({ ...filter, favorite: !filter?.favorite })}>
                        {filter.favorite ? <Star htmlColor="gold" /> : <StarBorder />}
                    </IconButton>
                </Tooltip>

                <StatsButton filter={filter} />

            </div>

        </div>

        <div ref={expandRef}
            style={{
                maxHeight: expandedHeight, paddingBottom: expanded ? "15px" : "0px",
                overflowY: "hidden", transition: "max-height 0.2s ease"
            }}
        >
            <div
                style={{
                    display: "flex", gap: "20px", width: "100%",
                    alignItems: "center", paddingTop: "6px"
                }}
            >
                <div style={{ display: "flex", flexWrap: 'wrap', width: '100%', marginBottom: "0px", gap: "10px", flex: '1', }}>

                    <div style={{ display: "flex", gap: "10px", flex: 1, flexWrap: width < 605 ? "wrap" : undefined }}>
                        <TextField type="date"
                            value={fromDate} placeholder="" label="From" onChange={(e) => {
                                setFromDate(e.target.value)
                                const year = Number.parseInt(e.target.value.split("-")[0]);
                                if (year < 2020 || year > 9999) return;
                                setFilter({ ...filter, fromDate: e.target.value.trim() })
                            }}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><CalendarMonth /></InputAdornment>, } }}
                            style={{ flex: "1", minWidth: "180px" }}
                        />

                        <TextField type="date"
                            value={toDate} placeholder="" label="To" onChange={(e) => {
                                setToDate(e.target.value)
                                const year = Number.parseInt(e.target.value.split("-")[0]);
                                if (year < 2020 || year > 9999) return;
                                setFilter({ ...filter, toDate: e.target.value.trim() })
                            }}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><CalendarMonth /></InputAdornment>, } }}
                            style={{ flex: "1", minWidth: "180px" }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: "10px", flex: '1', flexWrap: width < 605 ? "wrap" : undefined }}>
                        <LoraSelector lora={filter.lora ?? ""} setLora={(e) => setFilter({ ...filter, lora: e.alias })} style={{ flex: "1", minWidth: "200px" }} showAll />
                        <ModelSelector model={filter.model ?? ""} setModel={(e) => setFilter({ ...filter, model: e.title })} style={{ flex: "1", minWidth: "200px" }} showNone />
                    </div>

                </div>
                <div style={{
                    display: "flex", gap: "10px", flexDirection: vertical ? "column" : undefined, justifyContent: 'center',
                    width: !vertical ? "110px" : undefined, paddingRight: !vertical ? "10px" : "0px"
                }}>
                    <Tooltip title={filter.upscaled ? "Show all" : "Show Upscaled"}>
                        <IconButton onClick={() => setFilter({ ...filter, upscaled: !filter?.upscaled })}>
                            {filter.upscaled ? <Gradient color="info" /> : <Gradient />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={filter.upscaled ? "Show all" : "Show Downloaded"}>
                        <IconButton onClick={() => setFilter({ ...filter, downloaded: !filter?.downloaded })}>
                            {filter.downloaded ? <Download color="primary" /> : <Download />}
                        </IconButton>
                    </Tooltip>
                </div>
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
    </>
}