import { ArrowBack, ArrowForward, Coffee, Delete, Download, Gradient, ReceiptLong, ReceiptLongTwoTone, Star, StarOutlineOutlined } from "@mui/icons-material";
import { Button, Card, CircularProgress, ClickAwayListener, IconButton, ListItemIcon, Menu, MenuItem, Paper, Popper, Tooltip } from "@mui/material";
import useUserAgent from "../../hooks/useUserAgent";
import "./ImageHotbar.css"
import { GeneratedImage } from "../../../model/GeneratedImage";
import { Prompt } from "../../../model/Prompt";
import { useEffect, useState } from "react";
import { usePingPong } from "../../hooks/usePingPong";
import PromptReorderButton from "../prompt/PromptReorderButton";
import { imageToPrompt } from "../Utils";
import { useUpscalers } from "../../hooks/useUpscalers";
import useModifierKeys from "../../hooks/useModifierKeys";

export default function ImageHotbar(props: {
    image?: GeneratedImage
    basePromptAvailable?: boolean
    onUsePrompt: (val: Prompt) => void,
    onLeft?: () => void
    onRight?: () => void
    onDelete?: () => void
    onDownload?: () => void
    onFavorite?: () => void
    onUpscale?: () => void
}) {

    const { onUsePrompt, image, basePromptAvailable, onDelete, onFavorite, onLeft, onRight, onDownload, onUpscale } = props;
    const { isMobile } = useUserAgent()
    const { pong } = usePingPong();
    const { ctrlHeld } = useModifierKeys();
    const sdAvailable = pong?.SD;
    const useBasePrompt = basePromptAvailable && ctrlHeld

    const { upscaleLoading, imageUpscalingId } = useUpscalers();

    const [deletePopperAnchor, setDeletePopperAnchor] = useState(null as any)
    const [downloadAgainPopperAnchor, setDownloadAgainPopperAnchor] = useState(null as any)
    const [upscaleAgainPopperAnchor, setUpscaleAgainPopperAnchor] = useState(null as any)
    const [brewAnchor, setBrewAnchor] = useState(null as any)
    const [promptAnchor, setPromptAnchor] = useState(null as any)

    const canNavigate = !!onLeft || !!onRight
    useEffect(() => {
        if (useBasePrompt && sdAvailable) {
            if (brewAnchor) setBrewAnchor(null)
            if (promptAnchor) setPromptAnchor(null)
        }
    }, [ctrlHeld])

    if (isMobile) return <></>

    return <>
        <Card style={{ marginBottom: '5px', transition: 'opacity 0.2s ease-in-out' }} className="hover-hotbar">
            <div style={{ display: 'flex', gap: '10px', padding: "5px" }}>
                {canNavigate && <>
                    <Tooltip title="Previous" enterDelay={250}>
                        <IconButton onClick={onLeft} disabled={!onLeft}><ArrowBack /></IconButton>
                    </Tooltip>
                    <hr />
                </>}
                <Tooltip title={image?.favorite ? "Unfavorite" : "Favorite"} enterDelay={250}>
                    <IconButton onClick={() => onFavorite?.()} disabled={!onFavorite}>{image?.favorite ? <Star htmlColor="gold" /> : <StarOutlineOutlined />}</IconButton>
                </Tooltip>
                <Tooltip title="Delete" enterDelay={250}>
                    <IconButton disabled={!onDelete} onClick={(e) => {
                        setDeletePopperAnchor(e.currentTarget)
                    }}>
                        <Delete />
                    </IconButton>
                </Tooltip>
                <hr />
                <Tooltip title="Download" enterDelay={250}>
                    <IconButton disabled={!onDownload} onClick={(e) => {
                        (image?.downloadCount ?? 0) > 0 ? setDownloadAgainPopperAnchor(e.currentTarget) : onDownload?.()
                    }}>
                        <Download color={(image?.downloadCount ?? 0) > 0 ? "primary" : "action"} />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Upscale" enterDelay={250}>
                    <IconButton disabled={!onUpscale || !sdAvailable || upscaleLoading} onClick={(e) => {
                        image?.hiResAvailable ? setUpscaleAgainPopperAnchor(e.currentTarget) : onUpscale?.()
                    }}>
                        {imageUpscalingId === image?.id ? <CircularProgress size={24} color="info" /> : <Gradient color={image?.hiResAvailable ? "info" : "action"} />}
                    </IconButton>
                </Tooltip>
                <hr />
                {sdAvailable && useBasePrompt ?
                    <PromptReorderButton
                        prompt={imageToPrompt(image, true)}
                        disabled={
                            (image?.basePrompt?.trim()?.length ?? 0) === 0 ||
                            image?.basePrompt === image?.prompt
                        }
                        onClick={() => setBrewAnchor(null)}
                        source="IMAGE_BASE"
                    />
                    : <Tooltip title="Brew" enterDelay={250}>
                        <IconButton disabled={!sdAvailable} onClick={(e) => setBrewAnchor(e.currentTarget)}>
                            <Coffee />
                        </IconButton>
                    </Tooltip>}
                <Tooltip title={`Use this${useBasePrompt ? " base" : ""} prompt`} enterDelay={250}>
                    <IconButton disabled={!onUsePrompt} onClick={(e) => setPromptAnchor(e.currentTarget)}>
                        {useBasePrompt ? <ReceiptLongTwoTone /> : <ReceiptLong />}
                    </IconButton>
                </Tooltip>
                {canNavigate && <>
                    <hr />
                    <Tooltip title="Next" enterDelay={250}>
                        <IconButton onClick={onRight} disabled={!onRight}><ArrowForward /></IconButton>
                    </Tooltip>
                </>}
            </div>



        </Card>

        {/* Download Again Popper  */}
        <Popper
            open={Boolean(downloadAgainPopperAnchor)} anchorEl={downloadAgainPopperAnchor}
            placement="top" disablePortal
        >
            <ClickAwayListener onClickAway={() => setDownloadAgainPopperAnchor(undefined)}>
                <Paper elevation={3} style={{ padding: "10px", textAlign: "center", marginBottom: '10px' }}>
                    <div style={{ padding: "10px", fontSize: '.8em' }}>
                        <div style={{ marginBottom: '10px' }}>Download again?</div>
                        <Button variant="text" size="small" onClick={() => {
                            onDownload?.()
                            setDownloadAgainPopperAnchor(null)
                        }}>
                            Download
                        </Button>
                    </div>
                </Paper>
            </ClickAwayListener>
        </Popper>

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

        {/* Upscale Again Popper  */}
        <Popper
            open={Boolean(upscaleAgainPopperAnchor)} anchorEl={upscaleAgainPopperAnchor}
            placement="top" disablePortal
        >
            <ClickAwayListener onClickAway={() => setUpscaleAgainPopperAnchor(undefined)}>
                <Paper elevation={3} style={{ padding: "10px", textAlign: "center", marginBottom: '10px' }}>
                    <div style={{ padding: "10px", fontSize: '.8em' }}>
                        <div style={{ marginBottom: '10px' }}>Upscale again?</div>
                        <Button variant="text" size="small" onClick={() => {
                            onUpscale?.()
                            setUpscaleAgainPopperAnchor(null)
                        }}>
                            Upscale
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
                menuButonMode prompt={imageToPrompt(image, true)}
                disabled={!basePromptAvailable}
                onClick={() => setBrewAnchor(null)}
                source="IMAGE_BASE"
            />
            <PromptReorderButton
                menuButonMode prompt={imageToPrompt(image)} onClick={() => setBrewAnchor(null)} source="IMAGE"
            />
        </Menu>

        {/* Prompt Menu */}
        <Menu
            anchorEl={promptAnchor} open={!!promptAnchor} onClose={() => setPromptAnchor(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'left', }}
            transformOrigin={{ vertical: 'top', horizontal: 'left', }}
        >
            <MenuItem
                onClick={() => { onUsePrompt(imageToPrompt(image, true)); setPromptAnchor(null) }}
                disabled={!basePromptAvailable}
            >
                <ListItemIcon><ReceiptLongTwoTone /></ListItemIcon>
                Use this base prompt
            </MenuItem>
            <MenuItem onClick={() => { onUsePrompt(imageToPrompt(image)); setPromptAnchor(null) }}>
                <ListItemIcon><ReceiptLong /></ListItemIcon>
                Use this prompt
            </MenuItem>
        </Menu>
    </>

}