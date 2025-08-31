import { imageUrl } from "../../../api/Images";

export default function AlbumThumbImg({ album, defaultImage }: {
    album: {
        thumbId?: number,
        firstFourImages?: number[]
    },
    defaultImage?: string
}) {
    return <div style={{ height: "100%", width: "100%", aspectRatio: "2/1", position: "relative" }}>
        <img src={defaultImage ?? '/colorcollection.png'} style={{ width: "100%", height: "100%", aspectRatio: "2/1", objectFit: 'cover', objectPosition: 'center center', position: 'absolute', left: '0', top: '0', }} />
        {
            album.thumbId
                ? <img src={imageUrl(album.thumbId)} style={{ width: "100%", height: "100%", aspectRatio: "2/1", objectFit: 'cover', objectPosition: 'center top', position: 'absolute', left: '0', top: '0' }} />
                : <div style={{ display: 'flex', flexWrap: "wrap", width: "100%", height: "100%", aspectRatio: "2/1", objectFit: 'cover', objectPosition: 'center top', position: 'absolute', left: '0', top: '0' }}>
                    {(album.firstFourImages?.length ?? 0) < 3
                        ? <img src={imageUrl(album.firstFourImages?.[0])} style={{ width: "100%", height: "100%", aspectRatio: "2/1", objectFit: 'cover', objectPosition: 'center top', position: 'absolute', left: '0', top: '0' }} />
                        : album.firstFourImages?.map((a) =>
                            <img key={`albumsample-${a}`} src={imageUrl(a)} style={{ flex: '1', width: "100%", height: "50%", aspectRatio: "2/1", objectFit: "cover", objectPosition: 'center top' }} />
                        )}
                </div>
        }
    </div>
}