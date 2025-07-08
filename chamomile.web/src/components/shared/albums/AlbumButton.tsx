import { PhotoLibrary } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";

export default function AlbumButton({ onClick }: {
    onClick: () => void
}) {

    return <Tooltip title={"Collections"}>
        <IconButton onClick={onClick}>
            <PhotoLibrary />
        </IconButton>
    </Tooltip>

}