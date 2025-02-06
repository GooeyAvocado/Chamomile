import { GeneratedImage } from "../../../model/GeneratedImage";
import { Card, CardActionArea } from "@mui/material";
import { imageUrl } from "../../../api/Images";

export default function ImageTile(props:{
    image:GeneratedImage
    onClick: ()=>void
}){

    const {image, onClick} = props;

    return <Card elevation={10} style={{ maxWidth: '10vw', width: '400px', minWidth:'100px', maxHeight:'10vw', height:"400px", minHeight:'100px', flexGrow:'1' }}>
                <CardActionArea onClick={onClick} style={{height:"100%", position:"relative"}}>
                <img src={'/outline.png'} style={{width:"50%", height:"50%", objectFit:'cover', objectPosition:'center top', position:'absolute', left:'0', top:'0', margin:'25%'}} />
                <img src={imageUrl(image.id)} style={{width:"100%", height:"100%", objectFit:'cover', objectPosition:'center top', position:'absolute', left:'0', top:'0'}} />
                </CardActionArea>
            </Card>


}