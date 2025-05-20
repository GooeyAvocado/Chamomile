import { useState } from "react";
import HelpModal from "./HelpModal";
import { IconButton, Tooltip } from "@mui/material";
import { HelpOutline } from "@mui/icons-material";

export default function HelpButton(){

    const [open, setOpen] = useState(false);
    const [everOpened, setEverOpened] = useState(false);

    const onHelp = () => {
        if(!everOpened) setEverOpened(true)
        setOpen(true);
    }

    return <>
    <Tooltip title="Show Help and About">
        <IconButton onClick={onHelp}><HelpOutline/></IconButton>
    </Tooltip>
    {everOpened && <HelpModal open={open} setOpen={setOpen}/>}
    </>

}