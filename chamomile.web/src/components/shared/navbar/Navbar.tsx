import { Divider, IconButton, ListItemIcon, Menu, MenuItem } from "@mui/material";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import ChamomileLogo from "../ChamomileLogo";
import StatusButton from "../StatusButton/StatusButton";
import { Coffee, GridView, Launch, Menu as MenuIcon, Monitor, PhotoLibrary, Settings } from "@mui/icons-material";
import { useState } from "react";
import SettingsSlidein from "../settings/SettingsSlidein";
import HelpButton from "../help/HelpButton";
import { useNavigate } from "react-router-dom";

export default function Navbar() {

    const { width } = useWindowDimensions();
    const [promptAnchor, setPromptAnchor] = useState(null as any)

    const [settingsOpen, setSettingsOpen] = useState(false)
    const nav = useNavigate();

    const onSettings = () => {
        onClose();
        setSettingsOpen(true)
    }

    const onClose = () => {
        setPromptAnchor(null)
    }

    const onDisplay = () => {
        window.open('/#/display', '_blank');
    };



    return <>
        <div style={{
            display: 'flex', justifyContent: "space-between", width: "100%", alignItems: "flex-end", background: "#252525",
            paddingLeft: "20px", paddingRight: "20px", paddingTop: "10px", paddingBottom: "20px"

        }}>
            <div onClick={() => { nav("/") }} style={{ cursor: 'pointer' }}>
                <ChamomileLogo hideWords={width < 450} small />
            </div>
            {/* This translation is for visual purposes. The steam of the chamomile cup makes it look like this is out of alignment */}
            <div style={{ display: 'flex', gap: "10px", transform: "translateY(7px)" }}>
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


            <MenuItem onClick={() => { onClose(); nav("/"); }} style={{ fontSize: ".8em" }}>
                <ListItemIcon><Coffee fontSize="small" /></ListItemIcon>
                Home
            </MenuItem>

            <MenuItem onClick={() => { onClose(); nav("/album/"); }} style={{ fontSize: ".8em" }}>
                <ListItemIcon><PhotoLibrary fontSize="small" /></ListItemIcon>
                Collections
            </MenuItem>
            <MenuItem onClick={() => { onClose(); nav("/grid/"); }} style={{ fontSize: ".8em" }}>
                <ListItemIcon><GridView fontSize="small" /></ListItemIcon>
                Grids
            </MenuItem>
            <MenuItem onClick={() => { onClose(); onDisplay(); }} style={{ fontSize: ".8em" }}>
                <ListItemIcon><Monitor fontSize="small" /></ListItemIcon>
                Display
                <Launch fontSize="small" style={{ marginLeft: "2px", scale: ".8" }} />
            </MenuItem>

            <Divider />

            <MenuItem onClick={() => { onSettings(); }} style={{ fontSize: ".8em" }}>
                <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
                Settings
            </MenuItem>



        </Menu>

        <SettingsSlidein open={settingsOpen} setOpen={setSettingsOpen} />

    </>
}