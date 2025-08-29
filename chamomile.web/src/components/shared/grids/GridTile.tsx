import { Card, CardActionArea } from "@mui/material";
import { Grid } from "../../../model/Grid";
import AlbumThumbImg from "../albums/AlbumThumbImg";

export default function GridTile({ grid, onClick }: {
    onClick: () => void,
    grid: Grid
}) {


    return <Card elevation={10} style={{
        flex: "1",
        position: "relative",
    }}>
        <CardActionArea onClick={onClick}>

            <AlbumThumbImg album={{ firstFourImages: grid.firstFour }} defaultImage="/grids.png" />

            <div style={{ padding: "10px", height: "85px" }}>
                <div style={{ display: 'flex' }}>
                    <div style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "100%", flex: "1"
                    }}>
                        <b>{grid.name}</b>
                    </div>
                    <div style={{ flexShrink: '0' }}>
                        {grid.xVals.length} x {grid.yVals.length}
                    </div>
                </div>
                <hr />
                <div
                    style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "100%",
                        whiteSpace: "normal"
                    }}
                >
                    {grid.notes}
                </div>
            </div>

        </CardActionArea>
    </Card>

}