import { Card, CardActionArea, Typography } from "@mui/material";
import { imageUrl } from "../../../api/Images";
import { Model } from "../../../model/Model";
import ModelTypePill from "./ModelType/ModelTypePill";
import ContextMenu from "../ContextMenu";
import { DoNotDisturbAlt } from "@mui/icons-material";

export default function ModelTile(props: {
    model: Model
    onClick: () => void
    onEdit?: () => void
    onViewImage?: () => void
}) {

    const { model, onClick, onEdit, onViewImage } = props

    return <Card>
       <ContextMenu options={[
            {text: 'Edit', onClick: onEdit },
            {type: 'divider'},
            {text: 'View Image', onClick: onViewImage, disabled: model.bannerImage === undefined },
       ]}>
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
                <div style={{top:'5px', right:'5px', position:'absolute'}}>
                    {!model.isAvailable && <DoNotDisturbAlt/>}
                </div>
            </div>
        </CardActionArea>
       </ContextMenu>
    </Card>

}