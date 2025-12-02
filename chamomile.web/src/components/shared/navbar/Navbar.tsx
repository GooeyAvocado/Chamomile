import { Divider, Drawer, IconButton, ListItemIcon, ListItem, ListItemButton, List, Box, Tooltip } from "@mui/material";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import ChamomileLogo from "../ChamomileLogo";
import StatusButton from "../StatusButton/StatusButton";
import { Coffee, GridView, HelpOutline, Launch, Menu as MenuIcon, Monitor, PhotoLibrary, Settings } from "@mui/icons-material";
import { useState } from "react";
import SettingsSlidein from "../settings/SettingsSlidein";
import { useNavigate } from "react-router-dom";
import HelpModal from "../help/HelpModal";

export default function Navbar() {

    const { width } = useWindowDimensions();
    const [menuOpen, setMenuOpen] = useState(false)

    const [settingsOpen, setSettingsOpen] = useState(false)
    const [helpOpen, setHelpOpen] = useState(false);
    //const [helpEverOpened, setHelpEverOpened] = useState(false);

    const nav = useNavigate();

    const onSettings = () => {
        onClose();
        setTimeout(() => setSettingsOpen(true), 0)
    }

    const onClose = () => {
        setMenuOpen(false)
    }

    const onDisplay = () => {
        setTimeout(() => window.open('/#/display', '_blank'), 0)
        // window.open('/#/display', '_blank');
    };

    const onHelp = () => {
        // if (!helpEverOpened) setHelpEverOpened(true)
        onClose();
        setTimeout(() => setHelpOpen(true), 0)
        // setHelpOpen(true);
    }

    return <>
        <div style={{
            display: 'flex', justifyContent: "space-between", width: "100%", alignItems: "flex-end", background: "#252525",
            paddingLeft: "20px", paddingRight: "20px", paddingTop: "10px", paddingBottom: "20px"

        }}>
            <div style={{ display: "flex", gap: "10px" }}>
                <IconButton onClick={() => setMenuOpen(true)} style={{ transform: "translateY(7px)" }} >
                    <MenuIcon />
                </IconButton>
                <div onClick={() => { nav("/") }} style={{ cursor: 'pointer' }}>
                    <ChamomileLogo hideWords={width < 450} small />
                </div>
            </div>
            {/* This translation is for visual purposes. The steam of the chamomile cup makes it look like this is out of alignment */}
            <div style={{ display: 'flex', gap: "10px", transform: "translateY(7px)" }}>
                <StatusButton />
                <Tooltip title="Help and About">
                    <IconButton onClick={onHelp}><HelpOutline /></IconButton>
                </Tooltip>
            </div>
        </div>

        <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} >
            <Box sx={{ width: 225, height: "100vh", display: "flex", flexDirection: 'column', overflow: "hidden" }} onClick={close} onKeyDown={close}>
                <div style={{ display: "flex", width: "100%", justifyContent: 'center', padding: "20px 0px" }}>
                    <ChamomileLogo hideWords />
                </div>
                <Divider />
                <List style={{ flex: "1" }}>
                    <ListItem disablePadding >
                        <ListItemButton onClick={() => { onClose(); nav("/"); }}>
                            <ListItemIcon><Coffee /></ListItemIcon>
                            <div style={{ padding: "5px 0px" }}>Home</div>
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding >
                        <ListItemButton onClick={() => { onClose(); nav("/album/"); }}>
                            <ListItemIcon><PhotoLibrary /></ListItemIcon>
                            <div style={{ padding: "5px 0px" }}>Collections</div>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => { onClose(); nav("/grid/"); }} >
                            <ListItemIcon><GridView /></ListItemIcon>
                            <div style={{ padding: "5px 0px" }}>Grids</div>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton disableRipple onClick={() => { onClose(); onDisplay(); }} >
                            <ListItemIcon><Monitor /></ListItemIcon>
                            <div style={{ padding: "5px 0px", display: 'flex', alignItems: 'center' }}>
                                Display
                                <Launch fontSize="small" style={{ marginLeft: "2px", scale: ".8" }} />
                            </div>
                        </ListItemButton>
                    </ListItem>
                </List>

                <Divider />
                <List>
                    <ListItem disablePadding >
                        <ListItemButton disableRipple onClick={() => { onHelp(); }}>
                            <ListItemIcon><HelpOutline /></ListItemIcon>
                            <div style={{ padding: "5px 0px" }}>Help and About</div>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding >
                        <ListItemButton disableRipple onClick={() => { onSettings(); }}>
                            <ListItemIcon><Settings /></ListItemIcon>
                            <div style={{ padding: "5px 0px" }}>Settings</div>
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>

        </Drawer>

        <SettingsSlidein open={settingsOpen} setOpen={setSettingsOpen} />
        {/* {helpEverOpened && <HelpModal open={helpOpen} setOpen={setHelpOpen} />} */}
        <HelpModal open={helpOpen} setOpen={setHelpOpen} />

    </>
}