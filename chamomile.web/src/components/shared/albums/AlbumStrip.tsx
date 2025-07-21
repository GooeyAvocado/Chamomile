import { useMemo } from "react";
import { useAlbums } from "../../hooks/useAlbums"
import ImageStrip from "../images/ImageStrip";

export default function AlbumStrip({ albums: albumIds, maxLength }: {
    albums: number[]
    maxLength?: number
}) {

    const { albums } = useAlbums();

    const images = useMemo(() =>
        albumIds.map(a => albums.find(b => b.id === a)?.firstFourImages?.[0])
        , [albumIds, albums]);

    return <ImageStrip images={images ?? []} maxLength={maxLength} />

}