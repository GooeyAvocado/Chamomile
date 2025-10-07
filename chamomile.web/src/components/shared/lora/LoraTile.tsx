import { Card, CardActionArea, Typography } from "@mui/material";
import { imageUrl } from "../../../api/Images";
import { Lora } from "../../../model/Lora";
import ModelTypePill from "../model/ModelType/ModelTypePill";
import ContextMenu from "../ContextMenu";
import { DoNotDisturbAlt, Edit, Image } from "@mui/icons-material";
import { NO_LORA_ALIAS } from "../Utils";

export default function LoraTile(props: {
    lora: Lora
    onClick: () => void
    onEdit?: () => void
    onViewImage?: () => void
}) {

    const { lora, onClick, onEdit, onViewImage } = props

    return <Card>
        <ContextMenu options={[
            { text: 'Edit', onClick: onEdit, icon: <Edit /> },
            { type: 'divider' },
            { text: 'View Image', onClick: onViewImage, disabled: lora.bannerImage === undefined || lora.bannerImage === null, icon: <Image /> },
        ]}>
            <CardActionArea onClick={onClick} style={{ aspectRatio: 1 / 1, width: '100%' }}>
                <div style={{ alignItems: 'center', position: 'relative' }}>
                    <div style={{ maxWidth: "100%", aspectRatio: 1 / 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src={lora.alias === NO_LORA_ALIAS ? "/outlinepadded-no.png" : "/outlinepadded.png"}
                            style={{ width: "70%" }}
                        />
                    </div>
                    {lora.bannerImage && <img loading="lazy"
                        src={imageUrl(lora.bannerImage)}
                        style={{
                            position: "absolute", top: "0px", left: "0px",
                            maxWidth: '100%', aspectRatio: 1 / 1,
                            objectFit: 'cover', objectPosition: 'center top'
                        }}
                    />}
                    <div style={{ bottom: '0px', left: '0px', padding: "2px", position: 'absolute', width: '100%', backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <Typography sx={{
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 1,
                            fontSize: '.8em',
                        }}>{lora.name}</Typography>
                    </div>
                    <div style={{ top: '5px', left: '5px', position: 'absolute' }}>
                        {lora.type?.length > 0 && <ModelTypePill type={lora.type} bgColor="rgba(0,0,0,.7)" />}
                    </div>
                    <div style={{ top: '5px', right: '5px', position: 'absolute' }}>
                        {!lora.isAvailable && <DoNotDisturbAlt />}
                    </div>
                </div>
            </CardActionArea>
        </ContextMenu>
    </Card>

}