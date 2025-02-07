import { Card } from "@mui/material";
import { ReactNode } from "react";

export default function BaseImageTile(props:{children:ReactNode}){

    //const max = '256px';
    //const min = '128px'

    return <Card elevation={10} style={{ 
            //maxWidth: max, 
            //minWidth: min,
            aspectRatio:1/1,
            flex:"1", 
            position:"relative" 
        }}>
        {props.children}
    </Card>

}