import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, InputAdornment, TextField, } from "@mui/material";
import { Search } from "@mui/icons-material";
import { Model } from "../../../model/Model";
import { useModels } from "../../hooks/useModels";
import ModelTile from "./ModelTile";

export default function ModelBrowserModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void,
    onOk: (val: Model) => void
}) {

    const { onOk, open, setOpen } = props;
    const {models} = useModels();

    const [query, setQuery] = useState("")
    const [tempQuery, setTempQuery] = useState("")
    
    return <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='lg'>
        <DialogTitle>Select a Model</DialogTitle>
        <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: "75vh" }}>
            <div style={{ display: 'flex', gap: '10px' }}>
                <TextField
                    value={tempQuery} onChange={(e) => setTempQuery(e.target.value)} onBlur={() => setQuery(tempQuery)}
                    placeholder="Search" fullWidth
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }}
                />

            </div>
            <div style={{ flex: '1', overflowY: 'auto' }}>
                <GridViewMode data={models} onOk={onOk} query={query}/>
            </div>

        </DialogContent>

    </Dialog>

}

function GridViewMode(props: { data: Model[], query: string, onOk: (val: Model) => void }) {
    const { data, query, onOk } = props

    return <div style={{
                display:'grid',
                gridTemplateColumns:`repeat(auto-fill, minmax(${'128'}px, 1fr))`,
                gap:'20px'
            }}>
                {data?.filter(a => query.trim().length === 0 ? true :a.name.toLowerCase().includes(query.toLowerCase()))
                    .map(a=> <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                    <ModelTile model={a} onClick={() => onOk(a)}/>
                </div> )}
            </div>

}
