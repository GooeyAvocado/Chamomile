import { Divider, IconButton, ListItemIcon, Menu, MenuItem } from "@mui/material";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import ChamomileLogo from "../ChamomileLogo";
import StatusButton from "../StatusButton/StatusButton";
import { Coffee, Menu as MenuIcon, PhotoLibrary, Settings } from "@mui/icons-material";
import { useState } from "react";
import SettingsSlidein from "../settings/SettingsSlidein";
import HelpButton from "../help/HelpButton";

export default function Navbar({ navBrew, navAlbums }: {
    navBrew: () => void
    navAlbums: () => void
}) {

    const { width } = useWindowDimensions();
    const [promptAnchor, setPromptAnchor] = useState(null as any)

    const [settingsOpen, setSettingsOpen] = useState(false)

    const onSettings = () => {
        onClose();
        setSettingsOpen(true)
    }

    const onClose = () => {
        setPromptAnchor(null)
    }

    return <>
        <div style={{ display: 'flex', justifyContent: "space-between", width: "100%", alignItems: "end" }}>
            <div onClick={navBrew} style={{ cursor: 'pointer' }}>
                <ChamomileLogo hideWords={width < 450} />
            </div>
            <div style={{ display: 'flex', gap: "10px" }}>
                <StatusButton />
                <HelpButton />
                <IconButton onClick={(e) => setPromptAnchor(e.currentTarget)} >
                    <MenuIcon />
                </IconButton>
            </div>
        </div>

        <Menu
            anchorEl={promptAnchor} open={!!promptAnchor} onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left', }}
            transformOrigin={{ vertical: 'top', horizontal: 'left', }}

        >


            <MenuItem onClick={() => { onClose(); navBrew(); }} style={{ fontSize: ".8em" }}>
                <ListItemIcon><Coffee fontSize="small" /></ListItemIcon>
                Home
            </MenuItem>

            <MenuItem onClick={() => { onClose(); navAlbums(); }} style={{ fontSize: ".8em" }}>
                <ListItemIcon><PhotoLibrary fontSize="small" /></ListItemIcon>
                Collections
            </MenuItem>

            <Divider />

            <MenuItem onClick={() => { onSettings(); }} style={{ fontSize: ".8em" }}>
                <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
                Settings
            </MenuItem>



        </Menu>

        <SettingsSlidein open={settingsOpen} setOpen={setSettingsOpen} />

        <hr style={{ width: "100%" }} />

    </>
}