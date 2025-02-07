import { GeneratedImage } from "../../../model/GeneratedImage";
import { CardActionArea } from "@mui/material";
import { imageUrl } from "../../../api/Images";
import BaseImageTile from "./BaseImageTile";

export default function ImageTile(props:{
    image:GeneratedImage
    onClick: ()=>void
}){

    const {image, onClick} = props;

    return <BaseImageTile>
                <CardActionArea onClick={onClick} style={{height:"100%", position:"relative"}}>
                <img src={'/outline.png'} style={{width:"50%", height:"50%", objectFit:'cover', objectPosition:'center top', position:'absolute', left:'0', top:'0', margin:'25%'}} />
                <img src={imageUrl(image.id)} style={{width:"100%", height:"100%", objectFit:'cover', objectPosition:'center top', position:'absolute', left:'0', top:'0'}} />
                </CardActionArea>
            </BaseImageTile>


}