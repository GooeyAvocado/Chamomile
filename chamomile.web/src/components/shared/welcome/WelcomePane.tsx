import { Coffee, Upload } from "@mui/icons-material";
import ChamomileLogo from "../ChamomileLogo";

export default function WelcomePane() {
    return <div style={{ height: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <ChamomileLogo wordsOverride="Welcome to Chamomile" />
        <div style={{ width: "425px", maxWidth: "100%" }}>
            <hr style={{ width: "100%", marginBottom: "10px" }} />

            <div style={{ display: "flex", gap: "30px" }}>
                <div style={{ flex: "1" }}>
                    <div style={{ width: "100%", textAlign: "center" }}>
                        <Coffee fontSize="inherit" style={{ fontSize: "48px" }} />
                        <div><b>Brew your first image</b></div>
                    </div>
                    <div style={{ fontSize: ".8em", textAlign: "justify" }}>
                        Use the prompt box above to write your first recipe, then hit brew!
                    </div>
                </div>
                <div style={{ alignSelf: "center" }}>
                    or
                </div>
                <div style={{ flex: "1" }}>
                    <div style={{ width: "100%", textAlign: "center" }}>
                        <Upload fontSize="inherit" style={{ fontSize: "48px" }} />
                        <div><b>Upload your collection</b></div>
                    </div>
                    <div style={{ fontSize: ".8em", textAlign: "justify" }}>
                        You can add your existing A1111 generated images by dragging and dropping them here!
                    </div>
                </div>

            </div>

            <hr style={{ width: "100%", marginBottom: "10px" }} />
            <div style={{ textAlign: 'center', fontSize: ".7em", opacity: ".8" }}>
                Confused? See the help and about documentation on the top right of the screen
            </div>
        </div>

    </div>
}