import { Card, CardActionArea, Typography } from "@mui/material";
import { imageUrl } from "../../../api/Images";
import { Lora } from "../../../model/Lora";
import ModelTypePill from "../model/ModelType/ModelTypePill";
import ContextMenu from "../ContextMenu";

export default function LoraTile(props: {
    lora: Lora
    onClick: () => void
    onEdit?: () => void
    onViewImage?: () => void
}) {

    const { lora, onClick, onEdit, onViewImage } = props

    return <Card>
        <ContextMenu options={[
                    {text: 'Edit', onClick: onEdit },
                    {type: 'divider'},
                    {text: 'View Image', onClick: onViewImage, disabled: lora.bannerImage === undefined },
               ]}>
        <CardActionArea onClick={onClick}>
            <div style={{ alignItems:'center', position:'relative' }}>
                <img
                    src={lora.bannerImage ? imageUrl(lora.bannerImage) : '/outline.png'}
                    style={{ maxWidth:'100%', aspectRatio:1/1, objectFit:'cover', objectPosition:'center top'}}
                />
                <div style={{bottom:'0px', left:'0px', padding:"2px", position:'absolute', width:'100%', backgroundColor:"rgba(0,0,0,0.5)"}}>
                    <Typography sx={{
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 1,
                        fontSize:'.8em',
                    }}>{lora.name}</Typography>
                </div>
                <div style={{top:'5px', left:'5px', position:'absolute'}}>
                    {lora.type?.length > 0 && <ModelTypePill type={lora.type} bgColor="rgba(0,0,0,.7)"/>}
                </div>
            </div>
        </CardActionArea>
        </ContextMenu>
    </Card>

}