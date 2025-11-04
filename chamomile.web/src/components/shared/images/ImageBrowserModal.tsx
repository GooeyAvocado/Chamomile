import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { GeneratedImage } from "../../../model/GeneratedImage";
import { useEffect, useState } from "react";
import { FilterOptions } from "../../../model/FilterOptions";
import FilterBuilder from "../filter/FilterBuilder";
import ImageViewer from "./ImageViewer";

export default function ImageBrowserModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void,
    onOk: (val: GeneratedImage) => void
    initialFilter?: FilterOptions
}) {

    const { onOk, open, setOpen, initialFilter } = props

    const blankFilter = {
        favorite: false,
        lora: "",
        model: "",
        query: ""
    } as FilterOptions

    const [filter, setFilter] = useState(initialFilter ?? blankFilter)

    useEffect(() => { if (open) setFilter(initialFilter ?? blankFilter) }, [open])

    return <Dialog open={open} onClose={() => setOpen(false)} maxWidth='lg' fullWidth>
        <DialogTitle>Select an Image</DialogTitle>
        <DialogContent style={{ height: "75vh", display: 'flex', flexDirection: 'column', gap: "10px" }}>
            <FilterBuilder filter={filter} setFilter={setFilter} />
            <hr style={{ width: "100%" }} />
            <div style={{ flex: "1", overflowY: 'auto', width: "100%", marginBottom: "20px" }}>
                <ImageViewer filter={filter} showBrewing showWelcome onClick={onOk} />
            </div>
        </DialogContent>
    </Dialog>

}