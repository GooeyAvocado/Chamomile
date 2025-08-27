import { Card, CardActionArea } from "@mui/material"
import ImageModalFromId from "./ImageModalFromId"
import { useState } from "react"
import { imageUrl } from "../../../api/Images"
import { Coffee, ReceiptLong, ReceiptLongTwoTone, Upload } from "@mui/icons-material"
import { getPrompts } from "../../../api/Prompts"
import useApi from "../../hooks/useApi"

export default function AdditionalInfoRenderer({
    additionalInformation,
}: {
    additionalInformation: any
}) {

    const [imageOpen, setImageOpen] = useState(false)

    switch (additionalInformation.Source || additionalInformation.source) {
        case "SAVED_PROMPT":
            return <>
                <Card style={{ padding: "10px", display: 'flex', gap: "10px", alignItems: 'center' }}>
                    <Card style={{ flexShrink: "0" }}>
                        <CardActionArea onClick={() => setImageOpen(true)}>
                            <img src={imageUrl(additionalInformation.Sample)} width={48} />
                        </CardActionArea>
                    </Card>
                    <ReceiptLong />
                    <div>
                        <div>Recipe Re-Order</div>
                        <div style={{ fontSize: ".7em" }}>This image is a re-order of an existing recipe</div>
                    </div>
                </Card>
                <ImageModalFromId open={imageOpen} setOpen={setImageOpen} image={additionalInformation.Sample} />
            </>
        case "IMAGE_BASE":
            return <>
                <Card style={{ padding: "10px", display: 'flex', gap: "10px", alignItems: 'center' }}>
                    <Card style={{ flexShrink: "0" }}>
                        <CardActionArea onClick={() => setImageOpen(true)}>
                            <img src={imageUrl(additionalInformation.Sample)} width={48} />
                        </CardActionArea>
                    </Card>
                    <ReceiptLongTwoTone />
                    <div>
                        <div>Base Re-Order</div>
                        <div style={{ fontSize: ".7em" }}>This image is a re-order of the base prompt of another image</div>
                    </div>

                </Card>
                <ImageModalFromId open={imageOpen} setOpen={setImageOpen} image={additionalInformation.Sample} />
            </>
        case "IMAGE":
            return <>
                <Card style={{ padding: "10px", display: 'flex', gap: "10px", alignItems: 'center' }}>
                    <Card style={{ flexShrink: "0" }}>
                        <CardActionArea onClick={() => setImageOpen(true)}>
                            <img src={imageUrl(additionalInformation.Sample)} width={48} />
                        </CardActionArea>
                    </Card>
                    <ReceiptLong />
                    <div>
                        <div>Re-Order</div>
                        <div style={{ fontSize: ".7em" }}>This image is a re-order of an existing image</div>
                    </div>

                </Card>
                <ImageModalFromId open={imageOpen} setOpen={setImageOpen} image={additionalInformation.Sample} />
            </>
        case "PROMPTBOX":
            return <Card style={{ padding: "10px", display: 'flex', gap: "10px", alignItems: 'center' }}>
                <Coffee />
                <div>
                    <div>Original prompt</div>
                    <div style={{ fontSize: ".7em" }}>This image is an original prompt from the prompt box</div>
                </div>

            </Card>
        case "UPLOAD":
            return <Card style={{ padding: "10px", display: 'flex', gap: "10px", alignItems: 'center' }}>
                <Upload />
                <div>
                    <div>Upload</div>
                    <div style={{ fontSize: ".7em" }}>This image was externally generated</div>
                </div>

            </Card>
        default: return <table>
            <tbody>
                {Object.keys(additionalInformation).map(k => <tr>
                    <td style={{ paddingRight: "20px" }}><b>{k}</b></td>
                    <td>{additionalInformation[k]}</td>
                </tr>)}
            </tbody>
        </table>
    }



}