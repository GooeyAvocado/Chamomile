import { GitHub } from "@mui/icons-material";
import ChamomileLogo from "../../ChamomileLogo";
import { Link } from "@mui/material";

export default function AboutTab() {
    return <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', width: "50%", minWidth: '300px' }}>
            <ChamomileLogo />
            <div>V2.0</div>
        </div>
        <hr style={{ width: "50%", minWidth: '300px' }} />
        <img src="/images/googgos.png" style={{ width: "50%", minWidth: "300px" }} />
        <hr style={{ width: "50%", minWidth: '300px' }} />
        <div style={{ marginBottom: '20px' }}>See more of the Googgos on CivitAI</div>
        <div style={{ marginTop: "10px", display: "flex", flexDirection: 'column', gap: "10px" }}>
            <div style={{ display: 'flex', gap: "10px" }}>
                <GitHub />
                <Link href="https://github.com/GooeyAvocado/Chamomile">Chamomile's Source Code</Link>
            </div>
        </div>
        <img src="/cc0.png" style={{ marginTop: '10px', width: "128px" }} />
    </>
}