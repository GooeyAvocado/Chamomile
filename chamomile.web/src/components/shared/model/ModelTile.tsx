import { Card, CardActionArea, Typography } from "@mui/material";
import { imageUrl } from "../../../api/Images";
import { Model } from "../../../model/Model";
import ModelTypePill from "./ModelType.tsx/ModelTypePill";

export default function ModelTile(props: {
    model: Model
    onClick: () => void
}) {

    const { model, onClick } = props

    return <Card>
        <CardActionArea onClick={onClick}>
            <div style={{ alignItems:'center', position:'relative' }}>
                <img
                    src={model.bannerImage ? imageUrl(model.bannerImage) : '/outline.png'}
                    style={{ maxWidth:'100%', aspectRatio:1/1, objectFit:'cover', objectPosition:'center top'}}
                />
                <div style={{bottom:'0px', left:'0px', padding:"2px", position:'absolute', width:'100%', backgroundColor:"rgba(0,0,0,0.5)"}}>
                    <Typography sx={{
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 1,
                        fontSize:'.8em',
                    }}>{model.name}</Typography>
                </div>
                <div style={{top:'5px', left:'5px', position:'absolute'}}>
                                    {model.type?.length > 0 && <ModelTypePill type={model.type} bgColor="rgba(0,0,0,.7)"/>}
                                </div>
            </div>
        </CardActionArea>
    </Card>

}