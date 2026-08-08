import { useMemo } from "react";
import { useAlbums } from "../../hooks/useAlbums"
import ImageStrip from "../images/ImageStrip";

export default function AlbumStrip({ albums: albumIds, maxLength }: {
    albums: number[]
    maxLength?: number
}) {

    const { albums } = useAlbums();

    const images = useMemo(() =>
        albumIds.map(a => {
            const album = albums?.find(b => b.id === a)
            return album ? {
                id: album.firstFourImages?.[0],
                tooltip: album.name
            } : undefined
        })
        , [albumIds, albums]);

    return <ImageStrip images={images ?? []} maxLength={maxLength} />

}