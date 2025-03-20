import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, InputAdornment, TextField, } from "@mui/material";
import { Search } from "@mui/icons-material";
import { Lora } from "../../../model/Lora";
import { useLoras } from "../../hooks/useLoras";
import LoraTile from "./LoraTile";

export default function LoraBrowserModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void,
    onOk: (val: Lora) => void
}) {

    const { onOk, open, setOpen } = props;
    const {loras} = useLoras();

    const [query, setQuery] = useState("")
    const [tempQuery, setTempQuery] = useState("")
    
    return <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='lg'>
        <DialogTitle>Select a LoRA</DialogTitle>
        <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: "75vh" }}>
            <div style={{ display: 'flex', gap: '10px' }}>
                <TextField
                    value={tempQuery} onChange={(e) => setTempQuery(e.target.value)} onBlur={() => setQuery(tempQuery)}
                    placeholder="Search" fullWidth
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }}
                />

            </div>
            <div style={{ flex: '1', overflowY: 'auto' }}>
                <GridViewMode data={loras} onOk={onOk} query={query}/>
            </div>

        </DialogContent>

    </Dialog>

}

function GridViewMode(props: { data: Lora[], query: string, onOk: (val: Lora) => void }) {
    const { data, query, onOk } = props

    return <div style={{
                display:'grid',
                gridTemplateColumns:`repeat(auto-fill, minmax(${'128'}px, 1fr))`,
                gap:'20px'
            }}>
                {data?.filter(a => query.trim().length === 0 ? true :a.name.toLowerCase().includes(query.toLowerCase()))
                    .map(a=> <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                    <LoraTile lora={a} onClick={() => onOk(a)}/>
                </div> )}
            </div>

}
