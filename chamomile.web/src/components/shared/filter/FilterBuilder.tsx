import { IconButton, InputAdornment, TextField, Tooltip } from "@mui/material";
import { FilterOptions } from "../../../model/FilterOptions";
import { useEffect, useState } from "react";
import { CalendarMonth, Close, ExpandLess, ExpandMore, Refresh, Search, Star, StarBorder } from "@mui/icons-material";
import ModelSelector from "../model/ModelSelector";
import LoraSelector from "../lora/LoraSelector";

export default function FilterBuilder(props: {
    filter: FilterOptions
    setFilter: (val: FilterOptions) => void
}) {

    const { filter, setFilter } = props

    const [query, setQuery] = useState("")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")

    const [expanded, setExpanded] = useState(false)

    useEffect(() => {
        setQuery(filter.query ?? "");
    }, [filter])

    const filterEmpty = filter.favorite === false 
        && filter.fromDate==='' 
        && filter.toDate===''
        && filter.lora===''
        && filter.model===''
        && filter.query?.trim()===''

    return <>
        <div style={{ width: "100%", display: 'flex', gap: "20px", marginBottom: "10px", marginTop: "10px", flexWrap: "wrap", justifyContent: 'space-between' }}>
            <TextField value={query} onChange={(e) => { setQuery(e.target.value) }} placeholder="Search" onBlur={() => {
                if (filter.query?.trim() !== query.trim()) { setFilter({ ...filter, query: query.trim() }) }
            }}
                slotProps={{
                    input: {
                        startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                        endAdornment: <InputAdornment position="end">
                            {!filterEmpty && <Tooltip title="Clear filter">
                                <IconButton 
                                    onClick={() => { setFilter({favorite: false, fromDate: "", toDate:"", lora:'', model:'',lastImage:0,query:''} as FilterOptions) }}>
                                        <Close/>
                                </IconButton>
                            </Tooltip>}
                            <Tooltip title="More Options">
                                <IconButton onClick={() => { setExpanded(!expanded) }}>{expanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
                            </Tooltip>
                        </InputAdornment>
                    }
                }}
                style={{ flex: "1", minWidth: '250px' }}
            />

            <div style={{ display: "flex", alignItems: 'center', justifyContent: 'end', flexShrink: "1", gap: "10px" }}>
                <Tooltip title={filter.favorite ? "Show all" : "Show Favorites"}><IconButton onClick={() => setFilter({ ...filter, favorite: !filter?.favorite })}>{filter.favorite ? <Star /> : <StarBorder />}</IconButton></Tooltip>
                <Tooltip title="Refresh"><IconButton onClick={() => setFilter({ ...filter })}><Refresh /></IconButton></Tooltip>
            </div>

        </div>
        {expanded && <div style={{ display: "flex", flexWrap:'wrap', width: '100%', marginBottom: "10px", gap: "20px" }}>

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

<LoraSelector lora={filter.lora ?? ""} setLora={(e) => setFilter({ ...filter, lora: e.alias })} style={{flex:"1", minWidth:'200px'}} showNone/>
<ModelSelector model={filter.model ?? ""} setModel={(e) => setFilter({ ...filter, model: e.title })} style={{flex:"1", minWidth:'200px'}} showNone/>

        </div>}
    </>
}