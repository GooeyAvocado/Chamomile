import { Card, CardActionArea } from "@mui/material"

export default function NewAlbumTile({ onClick }: {
    onClick: () => void
}) {

    return <Card elevation={10} style={{
        flex: "1",
        position: "relative",
    }}>
        <CardActionArea onClick={onClick}>

            <div style={{ height: "100%", width: "100%", aspectRatio: "2/1", position: "relative" }}>
                <img src={'/colorcollection.png'} style={{ width: "100%", height: "100%", aspectRatio: "2/1", objectFit: 'cover', objectPosition: 'center center', position: 'absolute', left: '0', top: '0', }} />
            </div>
            <div style={{ padding: "10px", height: "85px" }}>
                <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                    <b>New Collection</b>
                </div>
                <hr />
                <div>Create a new collection of brews from scratch</div>
            </div>

        </CardActionArea>
    </Card>
}