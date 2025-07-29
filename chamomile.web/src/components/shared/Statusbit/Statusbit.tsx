import { Pause, PlayArrow, Stop } from "@mui/icons-material";
import { Card, CardActionArea, IconButton, Tooltip } from "@mui/material";
import { usePingPong } from "../../hooks/usePingPong";
import { useQueue } from "../../hooks/useQueue";
import AreYouSureModal from "../modals/AreYouSureModal";
import { useEffect, useRef, useState } from "react";

export default function Statusbit() {

    const contentRef = useRef<HTMLDivElement>(null);

    const { pong } = usePingPong();
    const { activeJob, paused, queue, togglePause, clearQueue } = useQueue(() => { });
    const [clearAys, setClearAys] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const [width, setWidth] = useState("0px")

    useEffect(() => {
        if (contentRef.current) {
            setWidth(expanded ? `${contentRef.current.scrollWidth + 12}px` : "0px");
        }
    }, [expanded, queue.length]);

    const status = pong?.SD
        ? activeJob
            ? "BUSY" : paused
                ? "PAUSED"
                : "READY"
        : "NOT READY"

    const colormap = {
        "BUSY": "#1177AA",
        "PAUSED": "#AA7711",
        "READY": "#227711",
        "NOT READY": "#AA1111"
    }

    const tooltipmap = {
        "BUSY": `Brewing ${queue.length} images`,
        "PAUSED": "Brewing paused",
        "READY": "Ready to brew",
        "NOT READY": "SD is unavailable"
    }

    const currentColor = colormap[status]
    const currentTooltip = tooltipmap[status]


    return <div
        style={{
            marginBottom: "5px", display: 'flex', justifyContent: 'flex-end',
            alignItems: 'center', padding: "0px 5px",
        }}>

        <div
            ref={contentRef}
            style={{
                display: 'flex', alignItems: 'center',
                gap: "10px", overflowX: 'hidden', width: width,
                opacity: expanded ? 1 : 0,
                transition: "width 0.3s ease, opacity 0.3s ease"
            }}
        >

            <div style={{ transform: "scale(0.8)", display: 'flex', gap: "5px", width: "70px" }}>

                <Tooltip title={paused ? "Resume orders" : "Pause orders"}>
                    <IconButton size="small" onClick={() => {
                        togglePause()
                        setExpanded(false)
                    }}>{
                            paused ? <PlayArrow /> : <Pause />
                        }</IconButton>
                </Tooltip>

                <Tooltip title="Cancel all orders">
                    <IconButton size="small" onClick={() => {
                        setClearAys(true)
                        setExpanded(false)
                    }} disabled={queue.length === 0}>
                        <Stop />
                    </IconButton>
                </Tooltip>

            </div>

            {queue.length > 0 && <div style={{
                background: currentColor, fontFamily: "arial", fontWeight: "bolder",
                padding: "2px 5px", fontSize: ".6em", borderRadius: "4px",
            }}>
                {queue.length}
            </div>}

        </div>

        <Card>
            <Tooltip title={currentTooltip}>
                <CardActionArea
                    onClick={() => setExpanded(!expanded)}
                    style={{
                        fontFamily: "arial", fontSize: ".7em", background: currentColor,
                        fontWeight: "bolder", padding: "3px 5px", borderRadius: "2px"
                    }}
                >
                    <div >
                        {status}
                    </div>
                </CardActionArea>
            </Tooltip>
        </Card>

        <AreYouSureModal open={clearAys} setOpen={setClearAys} title="Cancel all orders?" onYes={() => {
            setClearAys(false)
            clearQueue()
        }}>
            This will cancel brewing {queue.length} image(s)
        </AreYouSureModal>
    </div>
}