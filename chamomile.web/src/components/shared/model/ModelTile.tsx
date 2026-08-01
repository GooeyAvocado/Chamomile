import { Card, CardActionArea, Typography } from "@mui/material";
import { imageUrl } from "../../../api/Images";
import ModelTypePill from "./ModelType/ModelTypePill";
import ContextMenu from "../ContextMenu";
import { Check, DoNotDisturbAlt, Edit, Image, Lock } from "@mui/icons-material";
import { Model } from "../../../model/Model";

export default function ModelTile(props: {
    model: Model
    selected?: boolean
    locked?: boolean
    onClick: () => void
    onEdit?: () => void
    onViewImage?: () => void
}) {

    const { model, onClick, onEdit, onViewImage, selected, locked } = props

    return <Card style={selected ? { transform: "scale(0.9)", transition: "transform 0.1s ease" } : { transition: "transform 0.1s ease" }}>
        <ContextMenu options={[
            { text: 'Edit', onClick: onEdit, icon: <Edit /> },
            { type: 'divider' },
            { text: 'View Image', onClick: onViewImage, disabled: model.bannerImage === undefined || model.bannerImage === null, icon: <Image /> },
        ]}>
            <CardActionArea onClick={locked ? undefined : onClick}>
                <div style={{ alignItems: 'center', position: 'relative' }}>
                    <div style={{ maxWidth: "100%", aspectRatio: 1 / 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src={"/outline.png"}
                            style={{ width: "50%" }}
                        />
                    </div>

                    {model.bannerImage && <img loading="lazy"
                        src={imageUrl(model.bannerImage)}
                        style={{
                            position: "absolute", top: "0px", left: "0px",
                            maxWidth: '100%', aspectRatio: 1 / 1,
                            objectFit: 'cover', objectPosition: 'center top'
                        }}
                    />}

                    {(selected || locked) && <div
                        style={{
                            position: "absolute", top: "0px", left: "0px", bottom: "0px", right: "0px",
                            maxWidth: '100%', aspectRatio: 1 / 1,
                            display: "flex", flexDirection: 'column', alignItems: 'center', justifyContent: "center",
                            objectFit: 'cover', objectPosition: 'center top', backgroundColor: "rgba(0,0,0,0.5"
                        }}
                    >
                        {locked ? <Lock fontSize="inherit" style={{ fontSize: "5em" }} /> : <Check fontSize="inherit" style={{ fontSize: "5em" }} />}
                    </div>
                    }

                    <div style={{ bottom: '0px', left: '0px', padding: "2px", position: 'absolute', width: '100%', backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <Typography sx={{
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 1,
                            fontSize: '.8em',
                        }}>{model.name}</Typography>
                    </div>
                    <div style={{ top: '5px', left: '5px', position: 'absolute' }}>
                        {model.type?.length > 0 && <ModelTypePill type={model.type} bgColor="rgba(0,0,0,.7)" />}
                    </div>
                    <div style={{ top: '5px', right: '5px', position: 'absolute', display: 'flex', gap: '5px', flexDirection: 'column', alignItems: 'flex-end' }}>
                        {model.tags?.slice(0, 3).map((tag, i) =>
                            <ModelTypePill
                                key={tag} type={tag} bgColor="rgba(0,0,0,.7)"
                                style={{ fontSize: [.7, .6, .6][i] + "em", opacity: [1, .7, .7][i] }}
                            />)
                        }
                        {!model.isAvailable && <DoNotDisturbAlt color="error" style={{ backgroundColor: "rgba(0,0,0,.7", padding: "4px" }} />}
                    </div>
                </div>
            </CardActionArea>
        </ContextMenu>
    </Card>

}