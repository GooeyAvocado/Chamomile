import { Monitor } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";

export default function DisplayButton(){

    const handleClick = () => {
        window.open('/#/display', '_blank');
    };

    return <Tooltip title="Launch Display Page">
        <IconButton onClick={handleClick}><Monitor/></IconButton>
    </Tooltip>
}