import { GitHub } from "@mui/icons-material";
import ChamomileLogo from "../../ChamomileLogo";
import { Link, Tooltip } from "@mui/material";

export default function AboutTab() {
    return <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', width: "50%", minWidth: '300px' }}>
            <ChamomileLogo />
            <div>V2.0</div>
        </div>
        <hr style={{ width: "50%", minWidth: '300px' }} />
        <img src="/images/googgos.png" style={{ width: "50%", minWidth: "300px" }} />
        <hr style={{ width: "50%", minWidth: '300px' }} />
        <div style={{ marginBottom: '20px' }}>
            <Link color="info" href="https://civitai.green/posts/17173953"> See more of the <Tooltip title="Goo Doggos">
                <u style={{ textDecorationStyle: "dashed" }}>
                    Googgos
                </u></Tooltip> on CivitAI</Link>
        </div>
        <div style={{ marginTop: "10px", display: "flex", flexDirection: 'column', gap: "10px" }}>
            <div style={{ display: 'flex', gap: "10px" }}>
                <GitHub />
                <Link href="https://github.com/GooeyAvocado/Chamomile">Chamomile's Source Code</Link>
            </div>
        </div>
        <img src="/cc0.png" style={{ marginTop: '10px', width: "128px" }} />
    </>
}