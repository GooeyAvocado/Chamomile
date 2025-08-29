import { Card, CardActionArea, IconButton } from "@mui/material"
import ImageModalFromId from "./ImageModalFromId"
import { useState } from "react"
import { imageUrl } from "../../../api/Images"
import { ChevronRight, Coffee, GridView, ReceiptLong, ReceiptLongTwoTone, Upload } from "@mui/icons-material"
import PromptOrderData from "../../../model/PromptOrderData"
import { useLocation, useNavigate } from "react-router-dom"

export default function AdditionalInfoRenderer({
    additionalInformation,
}: {
    additionalInformation?: PromptOrderData
}) {

    const [imageOpen, setImageOpen] = useState(false)
    const nav = useNavigate();
    const location = useLocation();

    if (!additionalInformation) return <>No additional information</>

    switch (additionalInformation.source || additionalInformation.source) {
        case "GRID":
            return <>
                <Card style={{ padding: "10px" }}>
                    <div style={{ display: 'flex', gap: "10px", alignItems: 'center' }}>
                        <GridView />
                        <div style={{ flex: "1" }}>
                            <div>Grid</div>
                            <div style={{ fontSize: ".7em" }}>This image is from a grid of other images</div>
                        </div>
                        <div style={{ fontFamily: 'monospace', textAlign: "center" }}>
                            <div>{additionalInformation.xPos},{additionalInformation.yPos}</div>
                            <div style={{ fontSize: ".5em" }}>X,Y</div>
                        </div>
                        {!location.pathname.includes("grid") && <IconButton onClick={() => nav(`/grid/${additionalInformation.gridId}`)}>
                            <ChevronRight />
                        </IconButton>}
                    </div>
                    <hr />
                    <div style={{ fontFamily: "monospace", fontSize: '.7em' }}>
                        <div style={{ display: 'flex', gap: "10px", alignItems: 'flex-start' }}>
                            <div style={{ flexShrink: 0 }}>X:</div>
                            <div style={{ flex: "1" }}>{additionalInformation.xVal}</div>
                        </div>
                        <div style={{ display: 'flex', gap: "10px", alignItems: 'flex-start' }}>
                            <div style={{ flexShrink: 0 }}>Y:</div>
                            <div style={{ flex: "1" }}>{additionalInformation.yVal}</div>
                        </div>
                    </div>
                </Card>
            </>
        case "SAVED_PROMPT":
            return <>
                <Card style={{ padding: "10px", display: 'flex', gap: "10px", alignItems: 'center' }}>
                    <Card style={{ flexShrink: "0" }}>
                        <CardActionArea onClick={() => setImageOpen(true)}>
                            <img src={imageUrl(additionalInformation.sample)} width={48} />
                        </CardActionArea>
                    </Card>
                    <ReceiptLong />
                    <div>
                        <div>Recipe Re-Order</div>
                        <div style={{ fontSize: ".7em" }}>This image is a re-order of an existing recipe</div>
                    </div>
                </Card>
                <ImageModalFromId open={imageOpen} setOpen={setImageOpen} image={additionalInformation.sample} />
            </>
        case "IMAGE_BASE":
            return <>
                <Card style={{ padding: "10px", display: 'flex', gap: "10px", alignItems: 'center' }}>
                    <Card style={{ flexShrink: "0" }}>
                        <CardActionArea onClick={() => setImageOpen(true)}>
                            <img src={imageUrl(additionalInformation.sample)} width={48} />
                        </CardActionArea>
                    </Card>
                    <ReceiptLongTwoTone />
                    <div>
                        <div>Base Re-Order</div>
                        <div style={{ fontSize: ".7em" }}>This image is a re-order of the base prompt of another image</div>
                    </div>

                </Card>
                <ImageModalFromId open={imageOpen} setOpen={setImageOpen} image={additionalInformation.sample} />
            </>
        case "IMAGE":
            return <>
                <Card style={{ padding: "10px", display: 'flex', gap: "10px", alignItems: 'center' }}>
                    <Card style={{ flexShrink: "0" }}>
                        <CardActionArea onClick={() => setImageOpen(true)}>
                            <img src={imageUrl(additionalInformation.sample)} width={48} />
                        </CardActionArea>
                    </Card>
                    <ReceiptLong />
                    <div>
                        <div>Re-Order</div>
                        <div style={{ fontSize: ".7em" }}>This image is a re-order of an existing image</div>
                    </div>

                </Card>
                <ImageModalFromId open={imageOpen} setOpen={setImageOpen} image={additionalInformation.sample} />
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
                    <td>{(additionalInformation as any)[k]}</td>
                </tr>)}
            </tbody>
        </table>
    }



}