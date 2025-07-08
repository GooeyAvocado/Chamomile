import { ArrowBack, ArrowForward, Coffee, CoffeeOutlined, Delete, Star, StarOutline, Terminal, TerminalTwoTone } from "@mui/icons-material";
import { Button, Card, ClickAwayListener, IconButton, ListItemIcon, Menu, MenuItem, Paper, Popper, Tooltip } from "@mui/material";
import useUserAgent from "../../hooks/useUserAgent";
import "./ImageHotbar.css"
import { GeneratedImage } from "../../../model/GeneratedImage";
import { Prompt } from "../../../model/Prompt";
import { useState } from "react";
import { usePingPong } from "../../hooks/usePingPong";
import PromptReorderButton from "../prompt/PromptReorderButton";
import { imageToPrompt } from "../Utils";

export default function ImageHotbar(props: {
    image?: GeneratedImage
    onUsePrompt: (val: Prompt) => void,
    onLeft?: () => void
    onRight?: () => void
    onDelete?: () => void
    onFavorite?: () => void
}) {

    const { onUsePrompt, image, onDelete, onFavorite, onLeft, onRight } = props;
    const { isMobile } = useUserAgent()
    const { pong } = usePingPong();
    const sdAvailable = pong?.SD;

    const [deletePopperAnchor, setDeletePopperAnchor] = useState(null as any)
    const [brewAnchor, setBrewAnchor] = useState(null as any)
    const [promptAnchor, setPromptAnchor] = useState(null as any)

    if (isMobile || !onLeft) return <></>

    return <>
        <Card style={{ marginBottom: '5px', transition: 'opacity 0.2s ease-in-out' }} className="hover-hotbar">
            <div style={{ display: 'flex', gap: '10px', padding: "5px" }}>
                <Tooltip title="Previous" enterDelay={250}>
                    <IconButton onClick={onLeft}><ArrowBack /></IconButton>
                </Tooltip>
                <hr />
                <Tooltip title={image?.favorite ? "Unfavorite" : "Favorite"} enterDelay={250}>
                    <IconButton onClick={onFavorite}>{image?.favorite ? <Star htmlColor="gold" /> : <StarOutline />}</IconButton>
                </Tooltip>
                <Tooltip title="Delete" enterDelay={250}>
                    <IconButton onClick={(e) => {
                        setDeletePopperAnchor(e.currentTarget)
                    }}>
                        <Delete />
                    </IconButton>
                </Tooltip>
                <hr />
                <Tooltip title="Brew" enterDelay={250}>
                    <IconButton disabled={!sdAvailable} onClick={(e) => setBrewAnchor(e.currentTarget)}>
                        <Coffee />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Use this Prompt" enterDelay={250}>
                    <IconButton onClick={(e) => setPromptAnchor(e.currentTarget)}>
                        <Terminal />
                    </IconButton>
                </Tooltip>
                <hr />
                <Tooltip title="Next" enterDelay={250}>
                    <IconButton onClick={onRight}><ArrowForward /></IconButton>
                </Tooltip>
            </div>



        </Card>

        {/* Delete Confirm Popper */}
        <Popper
            open={Boolean(deletePopperAnchor)} anchorEl={deletePopperAnchor}
            placement="top" disablePortal
        >
            <ClickAwayListener onClickAway={() => setDeletePopperAnchor(undefined)}>
                <Paper elevation={3} style={{ padding: "10px", textAlign: "center", marginBottom: '10px' }}>
                    <div style={{ padding: "10px", fontSize: '.8em' }}>
                        <div style={{ marginBottom: '10px' }}>Are you sure?</div>
                        <Button variant="text" size="small" onClick={() => {
                            onDelete?.()
                            setDeletePopperAnchor(null)
                        }}>
                            Delete
                        </Button>
                    </div>
                </Paper>
            </ClickAwayListener>
        </Popper>

        {/* Brew Menu */}
        <Menu
            anchorEl={brewAnchor} open={!!brewAnchor} onClose={() => setBrewAnchor(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'left', }}
            transformOrigin={{ vertical: 'top', horizontal: 'left', }}
        >
            <PromptReorderButton
                menuButonMode prompt={imageToPrompt(image, true)} textSuffix="from base"
                iconOverride={<CoffeeOutlined />} disabled={(image?.basePrompt?.trim()?.length ?? 0) === 0}
                onClick={() => setBrewAnchor(null)}
            />
            <PromptReorderButton menuButonMode prompt={imageToPrompt(image)} onClick={() => setBrewAnchor(null)} />
        </Menu>

        {/* Prompt Menu */}
        <Menu
            anchorEl={promptAnchor} open={!!promptAnchor} onClose={() => setPromptAnchor(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'left', }}
            transformOrigin={{ vertical: 'top', horizontal: 'left', }}
        >
            <MenuItem
                onClick={() => { onUsePrompt(imageToPrompt(image, true)); setPromptAnchor(null) }}
                disabled={(image?.basePrompt?.trim()?.length ?? 0) === 0}
            >
                <ListItemIcon><TerminalTwoTone /></ListItemIcon>
                Use this base prompt
            </MenuItem>
            <MenuItem onClick={() => { onUsePrompt(imageToPrompt(image)); setPromptAnchor(null) }}>
                <ListItemIcon><Terminal /></ListItemIcon>
                Use this prompt
            </MenuItem>
        </Menu>
    </>

}