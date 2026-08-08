import { imageUrl } from "../../../api/Images"
import { Coffee, GridView, Upload } from "@mui/icons-material"
import PromptOrderData from "../../../model/PromptOrderData"
import { CSSProperties } from "react"

export default function AdditionalInfoRendererMini({
    additionalInformation,
}: {
    additionalInformation?: PromptOrderData
}) {

    if (!additionalInformation) return <>No additional information</>
    const hasSample = (additionalInformation?.sample ?? 0) > 0;

    const cardStyle: CSSProperties = { padding: "4px 8px", display: 'flex', gap: "8px", alignItems: 'center', fontSize: ".7em", color: "lightgray", border: "1px solid lightgray", borderRadius: "8px", justifyContent: 'left' }

    switch (additionalInformation.source || additionalInformation.source) {
        case "GRID":
            return <div style={cardStyle}>
                <GridView fontSize="small" />
                <div>Grid ({additionalInformation.xPos}, {additionalInformation.yPos})</div>
            </div>
        case "SAVED_PROMPT":
            return <div style={cardStyle}>
                <img src={imageUrl(additionalInformation.sample)} width={20} style={{ borderRadius: "3px" }} />
                <div>Recipe Re-Order</div>
            </div>
        case "IMAGE_BASE":
            return <div style={cardStyle}>
                <img src={imageUrl(additionalInformation.sample)} width={20} style={{ borderRadius: "3px" }} />
                <div>Base Re-Order</div>
            </div>
        case "IMAGE":
            return <div style={cardStyle}>
                <img src={imageUrl(additionalInformation.sample)} width={20} style={{ borderRadius: "3px" }} />
                <div>Re-Order</div>
            </div>
        case "PROMPTBOX":
            return <div style={cardStyle}>
                {hasSample
                    ? <img src={imageUrl(additionalInformation.sample)} width={20} style={{ borderRadius: "3px" }} />
                    : <Coffee fontSize="small" />
                }
                <div>{!hasSample ? "Original Prompt" : "Modified recipe"}</div>
            </div>

        case "UPLOAD":
            return <div style={cardStyle}>
                <Upload fontSize="small" />
                <div>Upload</div>
            </div>

        default: return <></>
    }



}