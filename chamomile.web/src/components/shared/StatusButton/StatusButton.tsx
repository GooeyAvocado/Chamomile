import { Pause, PlayArrow, Refresh, Stop, Warning } from "@mui/icons-material";
import { CircularProgress, Divider, IconButton, LinearProgress, ListItemIcon, Menu, MenuItem, Tooltip } from "@mui/material";
import { usePingPong } from "../../hooks/usePingPong";
import { useQueue } from "../../hooks/useQueue";
import AreYouSureModal from "../modals/AreYouSureModal";
import { useState } from "react";

export default function StatusButton() {


    const { pong, refreshPing } = usePingPong();
    const { activeJob, paused, queue, togglePause, clearQueue, batchTotalImages, batchImages, progress, sessionImages, etaMs, avgGenTime } = useQueue(() => { });
    const [clearAys, setClearAys] = useState(false)
    const [promptAnchor, setPromptAnchor] = useState(null as any)

    const imagePercentage = (progress?.progress ?? 0) * 100.0
    const batchPercentage = (batchImages - 1) * 100.0 / batchTotalImages

    const status = pong?.SD
        ? activeJob
            ? "BUSY" : paused
                ? "PAUSED"
                : "READY"
        : "NOT READY"

    const tooltipmap = {
        "BUSY": `Brewing ${queue.length} images`,
        "PAUSED": "Brewing paused",
        "READY": "Ready to brew",
        "NOT READY": "SD is unavailable"
    }

    const currentTooltip = tooltipmap[status]

    const onClose = () => {
        setPromptAnchor(null)
    }

    const CurrentIcon = () => {
        switch (status) {
            case "READY":
                return <PlayArrow color="success" />
            case "BUSY":
                return <div style={{ position: "relative", width: "24px", height: "24px" }}>
                    <CircularProgress size={24} value={batchPercentage} variant="determinate" style={{ position: "absolute", top: "0", left: "0" }} color="warning" />
                    <CircularProgress size={20} value={imagePercentage} variant="determinate" style={{ position: "absolute", top: "2px", left: "2px" }} />
                    <div style={{ fontSize: ".42em", position: "absolute", width: "24px", textAlign: "center", top: "6px" }}>{Math.min(99, queue.length + 1)}</div>
                </div>
            case "NOT READY":
                return <Warning color="warning" />
            case "PAUSED":
                return <Pause color="warning" />
            default:
                break;
        }
    }

    const batchEta = etaMs / 1000
    const batchEtaHours = Math.floor(batchEta / 3600)
    const batchEtaMinutesRemainder = Math.floor((batchEta % 3600) / 60)
    const batchEtaSecondsRemainder = Math.floor(batchEta % 60)


    const imageEta = progress?.eta_relative ?? 0
    const imageEtaMinutes = Math.floor(imageEta / 60)
    const imageEtaSecondsRemainder = Math.floor(imageEta % 60)



    return <>
        <Tooltip title={currentTooltip}>
            <IconButton onClick={(e) => setPromptAnchor(e.currentTarget)}>
                <CurrentIcon />
            </IconButton>
        </Tooltip>

        <Menu
            anchorEl={promptAnchor} open={!!promptAnchor} onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left', }}
            transformOrigin={{ vertical: 'top', horizontal: 'left', }}

        >
            <div style={{ fontSize: ".7em", padding: "8px 18px", width: "200px" }}>

                <div style={{ display: 'flex', justifyContent: "space-between" }}>
                    <div>Batch ({batchImages}/{batchTotalImages})</div>
                    {!isNaN(etaMs) && <Tooltip title={`ETA based on ${((avgGenTime ?? 0) / 1000).toFixed(2)}s per image`}>
                        <div style={{ opacity: ".7" }}>{batchEtaHours}:{batchEtaMinutesRemainder.toString().padStart(2, '0')}:{batchEtaSecondsRemainder.toString().padStart(2, '0')}</div>
                    </Tooltip>}
                </div>
                <LinearProgress value={batchPercentage} variant="determinate" />

                <div style={{ marginTop: "10px", display: 'flex', justifyContent: "space-between" }}>
                    <div>Image ({imagePercentage.toFixed(0)}%)</div>
                    {progress && <div style={{ opacity: ".7" }}>{imageEtaMinutes}:{imageEtaSecondsRemainder.toString().padStart(2, '0')}</div>}
                </div>
                <LinearProgress value={imagePercentage} variant="determinate" />
                <div style={{ marginTop: "16px" }}>{sessionImages} image(s) so far</div>
            </div>

            <Divider style={{ margin: "8px 0px" }} />

            {
                !pong?.SD && <MenuItem
                    onClick={() => {
                        onClose();
                        refreshPing()
                    }}
                    style={{ fontSize: ".8em" }}
                >
                    <ListItemIcon><Refresh fontSize="small" /></ListItemIcon>
                    Check SD Again
                </MenuItem>
            }

            <MenuItem
                onClick={() => { onClose(); togglePause(); }} style={{ fontSize: ".8em" }}
                disabled={!pong?.SD}
            >
                <ListItemIcon>{paused ? <PlayArrow color="success" fontSize="small" /> : <Pause color="warning" fontSize="small" />}</ListItemIcon>
                {paused ? "Resume" : "Pause"} orders
            </MenuItem>

            <MenuItem
                onClick={() => { onClose(); setClearAys(true) }}
                disabled={queue.length === 0} style={{ fontSize: ".8em" }}
            >
                <ListItemIcon><Stop color="error" fontSize="small" /></ListItemIcon>
                Cancel all orders
            </MenuItem>

        </Menu>

        <AreYouSureModal open={clearAys} setOpen={setClearAys} title="Cancel all orders?" onYes={() => {
            setClearAys(false)
            clearQueue()
        }}>
            This will cancel brewing {queue.length} image(s)
        </AreYouSureModal>

    </>
}