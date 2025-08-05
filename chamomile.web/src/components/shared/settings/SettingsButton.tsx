import { Settings } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { useState } from "react";
import SettingsSlidein from "./SettingsSlidein";

export default function SettingsButton() {

    const [settingsOpen, setSettingsOpen] = useState(false)

    return <>
        <Tooltip title="Open settings">
            <IconButton onClick={() => setSettingsOpen(true)}><Settings /></IconButton>
        </Tooltip>
        <SettingsSlidein open={settingsOpen} setOpen={setSettingsOpen} />
    </>

}