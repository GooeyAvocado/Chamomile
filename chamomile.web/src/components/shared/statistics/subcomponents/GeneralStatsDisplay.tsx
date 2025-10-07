import { ReactNode, useState } from "react"
import { imageUrl } from "../../../../api/Images"
import GeneralStatistics from "../../../../model/GeneralStatistics"
import KeywordUsage from "../../../../model/KeywordUsage"
import { useLoras } from "../../../hooks/useLoras"
import { useModels } from "../../../hooks/useModels"
import ImageModalFromId from "../../images/ImageModalFromId"
import StatsNumber from "./StatsNumber"
import { Card, CardActionArea } from "@mui/material"
import { Download, Gradient, Schedule, Star } from "@mui/icons-material"

export default function GeneralStatsDisplay({
    data, loraData, modelData, keywordData, limit
}: {
    limit: number
    data: GeneralStatistics
    loraData: KeywordUsage[]
    modelData: KeywordUsage[]
    keywordData: KeywordUsage[]
}) {

    const { models } = useModels();
    const { loras } = useLoras();

    const [viewerOpen, setViewerOpen] = useState(false)
    const [image, setImage] = useState<number>()

    const mostUsedModel = models?.find(a => a.title === modelData?.[0]?.keyword)
    const mostUsedLora = loras?.find(a => a.alias === loraData?.[0]?.keyword) ?? loras?.find(a => a.alias === loraData?.[1]?.keyword)

    return <>
        <div style={{ flex: "1", overflowY: 'auto', display: "flex", gap: "10px", flexDirection: 'column', textAlign: 'center', marginTop: "32px" }}>

            {/* Total */}
            <StatsNumber val={limit < 0 ? data?.totalCount : Math.min(limit, data?.totalCount)} label="Images" />

            {/* Most used */}
            <div style={{ display: 'flex', gap: "24px", justifyContent: 'center', width: "100%", marginTop: "24px" }}>

                <PreviewTile
                    setImage={setImage} setViewerOpen={setViewerOpen}
                    id={mostUsedModel?.bannerImage === 0 ? modelData?.[0]?.sample : mostUsedModel?.bannerImage ?? modelData?.[0]?.sample}
                    label="Most used checkpoint" value={mostUsedModel?.name ?? modelData?.[0]?.keyword}
                />

                <PreviewTile
                    setImage={setImage} setViewerOpen={setViewerOpen}
                    id={mostUsedLora?.bannerImage === 0 ? loraData?.[0]?.sample : mostUsedLora?.bannerImage ?? loraData?.[0]?.sample}
                    label="Most used LoRA" value={mostUsedLora?.name ?? loraData?.[0]?.keyword}
                />

                <PreviewTile
                    setImage={setImage} setViewerOpen={setViewerOpen}
                    id={keywordData?.[0]?.sample}
                    label="Most used keyword" value={keywordData?.[0]?.keyword}
                />

            </div>

            <div style={{ display: 'flex', gap: "24px", justifyContent: 'center', width: "100%", marginTop: "12px" }}>

                <IconTile
                    icon={<Download fontSize="inherit" color="primary" />}
                    value={data?.downloadCount}
                    label="Images downloaded"
                />

                <IconTile
                    icon={<Star fontSize="inherit" htmlColor="yellow" />}
                    value={data?.favCount}
                    label="Favorite images"
                />

                <IconTile
                    icon={<Gradient fontSize="inherit" color="info" />}
                    value={data?.upscaledCount}
                    label="Images downloaded"
                />

                <IconTile
                    icon={<Schedule fontSize="inherit" />}
                    value={(data?.avgGenTime / 1000).toFixed(2) + "s"}
                    label="Avg generation time"
                />

            </div>

            <div style={{ display: "flex", gap: "12px", margin: "auto", opacity: ".8", fontFamily: "merriweather" }}>
                <div>{new Date(data?.minTs).toLocaleDateString()}</div>
                <div> - </div>
                <div>{new Date(data?.maxTs).toLocaleDateString()}</div>

            </div>

        </div>
        <ImageModalFromId open={viewerOpen} setOpen={setViewerOpen} image={image} />
    </>
}

function PreviewTile({
    id, setViewerOpen, setImage,
    value, label
}: {
    id?: number
    value: string
    label: string
    setViewerOpen: (val: boolean) => void,
    setImage: (val?: number) => void
}) {
    return <div style={{ width: "25%", textAlign: 'center' }}>
        <Card style={{ width: "50%", aspectRatio: "1/1", margin: "auto" }}>
            <CardActionArea onClick={() => {
                setImage(id)
                setViewerOpen(true)
            }}>
                <img src={imageUrl(id)} style={{ width: "100%", height: "100%", aspectRatio: "1/1", objectFit: 'cover', objectPosition: 'center top' }} />
            </CardActionArea>
        </Card>
        <div style={{
            fontFamily: "Merriweather",
            marginTop: "10px",
            wordBreak: "break-word",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "100%",
            display: "block"
        }}>
            {value}
        </div>
        <div style={{ fontSize: '.7em' }}>{label}</div>
    </div>
}


function IconTile({
    icon,
    value, label
}: {
    icon: ReactNode
    value: number | string
    label: string
}) {
    return <div style={{ width: "20%", textAlign: 'center' }}>
        <div style={{ fontSize: "2em" }}>
            {icon}
        </div>
        <div style={{
            fontFamily: "Merriweather",
            marginTop: "-10px",
            wordBreak: "break-word",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "100%",
            display: "block"
        }}>
            {typeof value === "string" ? value : value > 1000 ? Math.round(value / 1000) + "k" : value}
        </div>
        <div style={{ fontSize: '.7em' }}>{label}</div>
    </div>
}