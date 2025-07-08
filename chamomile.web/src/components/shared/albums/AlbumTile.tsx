import { Card, CardActionArea } from "@mui/material"
import { Album } from "../../../model/Album"
import AlbumThumbImg from "./AlbumThumbImg"

export default function AlbumTile({
    album, onClick
}: {
    album: Album
    onClick: () => void
}) {

    return <Card elevation={10} style={{
        flex: "1",
        position: "relative",
    }}>
        <CardActionArea onClick={onClick}>

            <AlbumThumbImg album={album} />

            <div style={{ padding: "10px", height: "85px" }}>
                <div style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%"
                }}>
                    <b>{album.name}</b>
                </div>
                <hr />
                {(album.count ?? 0) > 2 && <div>{new Date(album.oldest ?? "").toLocaleDateString()} - {new Date(album.newest ?? "").toLocaleDateString()}</div>}
                {/* This just looks cleaner. I pity the soul that makes an album with exactly one image */}
                <div style={{ fontSize: ".8em" }}>{album.count} Images</div>
            </div>

        </CardActionArea>
    </Card>
}