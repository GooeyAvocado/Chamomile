import { Card, CardActionArea, Tooltip } from "@mui/material"
import { imageUrl } from "../../../../api/Images"
import { useState } from "react"
import { Close } from "@mui/icons-material"
import { Prompt } from "../../../../model/Prompt"
import { FilterOptions } from "../../../../model/FilterOptions"

export default function PromptboxImageSample({ prompt, filter, clearSample }: {
    prompt?: Prompt
    filter?: FilterOptions
    clearSample: () => void
}) {

    const [hovered, setHovered] = useState(false)

    return <Card style={{
        width: "32px",
        height: "32px",
        aspectRatio: "1/1"
    }}>
        <Tooltip placement="top" title={<>
            {prompt?.id
                ? <>
                    <div>Currently tied to a saved prompt </div>
                    <div>"{prompt.name}"</div>
                </>
                : filter ? <>
                    Currently tied to an existing image's prompt
                </> : <>
                    Currently searching for images based on an existing image.
                </>
            }
            <div style={{ marginTop: '10px' }}>Click to {filter ? "clear" : "unlink"}</div>
        </>}>
            <CardActionArea
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={clearSample}
                style={{ position: "relative" }}
            >
                <img
                    src={imageUrl(filter?.sample ?? prompt?.sampleImage)}
                    style={{ width: "100%", aspectRatio: "1/1", objectFit: 'cover', objectPosition: 'center top', position: 'absolute', left: '0', top: '0' }}
                />
                {
                    hovered && <div
                        style={{
                            width: "100%", aspectRatio: "1/1",
                            background: "rgba(0,0,0,0.5)",
                            display: 'flex', flexDirection: 'column',
                            justifyContent: 'center', alignItems: 'center',
                            position: 'absolute', left: '0', top: '0'
                        }}
                    >
                        <Close />
                    </div>
                }
            </CardActionArea>
        </Tooltip>
    </Card>

}