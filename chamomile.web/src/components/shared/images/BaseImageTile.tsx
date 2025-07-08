import { Card } from "@mui/material";
import React, { ReactNode } from "react";

export default function BaseImageTile(props: { children?: ReactNode, style?: React.CSSProperties }) {

    //const max = '256px';
    //const min = '128px'

    return <Card elevation={10} style={{
        //maxWidth: max, 
        //minWidth: min,
        aspectRatio: 1 / 1,
        flex: "1",
        position: "relative",
        ...props.style
    }}>
        {props.children}
    </Card>

}