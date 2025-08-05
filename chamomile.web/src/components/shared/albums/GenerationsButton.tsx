import { Coffee } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";

export default function GenerationsButton({ onClick }: {
    onClick: () => void
}) {

    return <Tooltip title={"Brewery"}>
        <IconButton onClick={onClick}>
            <Coffee />
        </IconButton>
    </Tooltip>

}