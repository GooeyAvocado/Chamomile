import { Stack } from "@mui/material"
import { Album } from "../../../model/Album"
import AlbumCard from "./AlbumCard"
import { useAlbums } from "../../hooks/useAlbums"

export default function ImageModalAlbumsDisplay({ albums, onView, onRemove, elevation }: {
    albums?: number[]
    onView?: (val: Album) => void
    onRemove?: (val: Album) => void
    elevation?: number
}) {

    const { loading } = useAlbums();

    return <>
        {!loading && albums && <>{albums.length === 0
            ? <div style={{ fontSize: ".8em" }}>This brew is not in any collections</div>
            : <Stack gap={"5px"}>
                {albums?.map(a => <AlbumCard album={a} onRemove={onRemove} onView={onView} elevation={elevation} />)}
            </Stack>}</>
        }

    </>
}