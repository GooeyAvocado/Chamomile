import { GitHub } from "@mui/icons-material";
import ChamomileLogo from "../../ChamomileLogo";
import { Button, Link, Tooltip } from "@mui/material";
import { useSettings } from "../../../hooks/useSettings";
import { CHAMOMILE_MAJOR_VERSION } from "../../WhatsNewModal/WhatsNew";

export default function AboutTab() {

    const { showWhatsNew } = useSettings();

    const backendBuild = import.meta.env.VITE_FRONTEND_BUILD ?? "v3-local"
    const frontendBuild = import.meta.env.VITE_BACKEND_BUILD ?? "v3-local"
    const buildTime = import.meta.env.VITE_BUILD_TIMESTAMP ? new Date(import.meta.env.VITE_BUILD_TIMESTAMP) : new Date();

    return <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', width: "50%", minWidth: '300px' }}>
            <ChamomileLogo />
            <div>V{CHAMOMILE_MAJOR_VERSION}</div>
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
            <div style={{ textAlign: 'center' }}><Button onClick={showWhatsNew}>What's new?</Button></div>
            <div style={{ display: 'flex', gap: "10px" }}>
                <GitHub />
                <Link href="https://github.com/GooeyAvocado/Chamomile">Chamomile's Source Code</Link>
            </div>
        </div>
        <img src="/cc0.png" style={{ marginTop: '10px', width: "128px" }} />
        <div style={{ marginTop: "10px", fontFamily: 'monospace', fontSize: '.8em', color: "#5F5F5F", position: "absolute", left: "14px", bottom: "14px" }}>
            <div>Backend: {backendBuild}</div>
            <div>Frontend: {frontendBuild}</div>
            <div>{buildTime.toLocaleString()}</div>
        </div>
    </>
}