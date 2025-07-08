import { Card, CardContent, CircularProgress, Stack } from "@mui/material"
import useApi from "../../hooks/useApi"
import { getImageAlbums } from "../../../api/Albums"
import { useEffect } from "react"
import { Album } from "../../../model/Album"
import AlbumCard from "./AlbumCard"

export default function ImageModalAlbumsDisplay({ imageId, onClick }: {
    imageId: number
    onClick: (val: Album) => void
}) {

    const albumsApi = useApi(getImageAlbums)
    const refresh = () => albumsApi.fetch(undefined, undefined, imageId)

    useEffect(() => {
        if (!imageId) return;
        albumsApi.resetData();
        const handler = setTimeout(() => {
            refresh()
        }, 1000)
        return () => clearTimeout(handler)
    }, [imageId])

    return <>
        <div style={{ marginTop: "20px" }}><b>Albums</b></div>
        <Card elevation={5}>
            <CardContent>
                {(!albumsApi.data || albumsApi.loading) ? <div>
                    <div style={{ textAlign: 'center' }}>
                        <CircularProgress size={24} />
                    </div>
                </div> : albumsApi.data?.length === 0
                    ? <div style={{ fontSize: ".8em", textAlign: "center" }}>No Albums</div>
                    : <Stack gap={"5px"}>
                        {albumsApi.data.map(a => <AlbumCard album={a} onClick={() => onClick(a)} refresh={refresh} />)}
                    </Stack>
                }
            </CardContent>
        </Card>

    </>
}