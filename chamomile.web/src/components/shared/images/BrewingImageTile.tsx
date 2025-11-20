import { CardActionArea, LinearProgress } from "@mui/material";
import BaseImageTile from "./BaseImageTile";

export default function BrewingImageTile(props: {
    imageSrc: string
    progress: number,
    onClick?: () => void
    eta?: number
}) {

    const { imageSrc, onClick, progress, eta } = props;

    return <BaseImageTile>
        <CardActionArea onClick={onClick} style={{ height: "100%", position: "relative" }}>
            {imageSrc.length > 0 && <img src={imageSrc} style={{ width: "100%", height: "100%", objectFit: 'cover', objectPosition: 'center top', position: 'absolute', left: '0', top: '0' }} />}
            <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", justifyContent: 'center', alignItems: 'center' }}>
                <img src="/brewing.gif" style={{ width: '100%', opacity: imageSrc.length > 0 ? ".0" : '.7', objectFit: 'contain' }} />
            </div>
            <div
                style={{
                    position: "absolute", left: 0, bottom: 0, width: "100%", display: "flex",
                    flexDirection: "column", justifyContent: 'flex-end', alignItems: 'center',
                    padding: '10px', background: 'rgba(32,32,32,0.5)'
                }}>
                <div style={{ textAlign: 'left', width: '100%', marginBottom: '2px', fontSize: '.8em' }}>{progress.toFixed(0)}% {eta ? `(${eta < 1 ? '<1' : eta.toFixed(0)}s)` : ''}</div>
                <LinearProgress value={progress} variant={progress === 0 || progress === 100 ? "indeterminate" : "determinate"} style={{ width: "100%" }} />
            </div>
        </CardActionArea>
    </BaseImageTile>


}