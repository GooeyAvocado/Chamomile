import { CardActionArea } from "@mui/material";
import { imageUrl } from "../../../api/Images";
import BaseImageTile from "./BaseImageTile";
import React from "react";

export default function ImageTileFromID(props: {
    image: number
    onClick?: () => void,
    style?: React.CSSProperties
}) {

    const { image, onClick, style } = props;

    return <BaseImageTile style={style}>
        <CardActionArea onClick={onClick} style={{ height: "100%", width: "100%", aspectRatio: "1/1", position: "relative" }}>
            <img src={'/outline.png'} style={{ width: "50%", height: "50%", objectFit: 'cover', objectPosition: 'center top', position: 'absolute', left: '0', top: '0', margin: '25%' }} />
            <img loading="lazy" src={imageUrl(image)} style={{ width: "100%", height: "100%", objectFit: 'cover', objectPosition: 'center top', position: 'absolute', left: '0', top: '0' }} />
        </CardActionArea>
    </BaseImageTile>


}