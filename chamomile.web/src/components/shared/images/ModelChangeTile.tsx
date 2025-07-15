import { LinearProgress } from "@mui/material";
import BaseImageTile from "./BaseImageTile";

export default function ModelChangeTile(props: {
    nextModel: string
}) {

    return <BaseImageTile>
        <div style={{ height: "100%", position: "relative" }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", background: "rgba(128,128,128,0.5)", display: "flex", flexDirection: "column", justifyContent: 'center', alignItems: 'center' }}>
                <img src="/brewing.gif" style={{ width: '100%', opacity: '.7', objectFit: 'contain' }} />
            </div>
            <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: 'flex-end', alignItems: 'center' }}>
                <div style={{ textAlign: 'left', width: '100%', marginBottom: '2px', fontSize: '.7em' }}>Changing to {props.nextModel}</div>
                <LinearProgress variant="indeterminate" style={{ width: "100%" }} />
            </div>
        </div>
    </BaseImageTile>


}