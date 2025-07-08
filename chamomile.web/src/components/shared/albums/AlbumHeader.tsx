import { Card, IconButton, Tooltip } from "@mui/material";
import { Album } from "../../../model/Album";
import { CheckCircle, Delete, Edit, Info } from "@mui/icons-material";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import { useState } from "react";
import useApi from "../../hooks/useApi";
import { deleteAlbum } from "../../../api/Albums";
import AreYouSureModal from "../modals/AreYouSureModal";
import { useSnackbar } from "notistack";
import AlbumEditor from "./AlbumEditor";
import AlbumThumbImg from "./AlbumThumbImg";

export default function AlbumHeader({ album, setAlbum }: {
    album: Album
    setAlbum: (val: Album | undefined) => void
}) {

    const { vertical } = useWindowDimensions();
    const [ays, setAys] = useState(false)
    const [editorOpen, setEditorOpen] = useState(false)
    const delApi = useApi(deleteAlbum)

    const { enqueueSnackbar } = useSnackbar();

    const onDelete = () => delApi.fetch(() => {
        setAlbum(undefined)
        enqueueSnackbar("Collection deleted!", { variant: 'success' })
    }, () => {
        enqueueSnackbar("Collection could not be deleted!", { variant: 'error' })
    }, album.id)

    return <div style={{ display: "flex", padding: vertical ? "0px" : "16px", gap: "16px", flex: "1 0", flexDirection: vertical ? "column" : undefined }}>

        <Card elevation={10} style={{ height: "128px", maxWidth: "350px", alignSelf: 'center' }}>
            <AlbumThumbImg album={album} />
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', flex: "1", height: "100%" }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>

                <div style={{ fontFamily: 'Merriweather', fontSize: "1.5em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: "1" }}>
                    {album.name}
                </div>

                {!vertical && (album.count ?? 0) > 2 &&
                    <div style={{ fontSize: ".8em", textAlign: "right", flex: "1, 0" }}>
                        {/* This just looks cleaner. I pity the soul that makes an album with exactly one image */}
                        <div style={{ fontSize: ".8em" }}>{album.count} Images</div>
                        <div>{new Date(album.oldest ?? "").toLocaleDateString()} - {new Date(album.newest ?? "").toLocaleDateString()}</div>
                    </div>
                }

            </div>

            <hr style={{ width: "100%" }} />

            <div style={{ flex: "1", display: "flex", justifyContent: 'space-between' }}>

                <div>
                    <div style={{ display: 'flex', gap: "8px" }}>

                        {album.searchQuery?.trim().length === 0
                            ? <Info color="info" fontSize="small" />
                            : <Tooltip title={`Images are being added to this album using this query`}>
                                <CheckCircle color="success" fontSize="small" />
                            </Tooltip>
                        }

                        <div style={{ fontFamily: 'monospace', fontSize: ".7em", marginTop: "2px" }}>
                            {album.searchQuery || "Images are not being automatically added"}
                        </div>
                    </div>

                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: "flex-end" }}>
                    <div style={{ display: 'flex', gap: "8px", flexDirection: vertical ? "column" : undefined }}>
                        <IconButton onClick={() => setEditorOpen(true)}><Edit fontSize="small" /></IconButton>
                        <IconButton onClick={() => setAys(true)}><Delete fontSize="small" /></IconButton>
                    </div>
                </div>
            </div>
        </div>

        <AlbumEditor open={editorOpen} setOpen={(val, result) => {
            setEditorOpen(val)
            if (result) setAlbum(result)
        }} album={album} />

        <AreYouSureModal onYes={onDelete} open={ays} setOpen={setAys} loading={delApi.loading} title="Are you sure you want to delete this collection?">
            This will not delete any images
        </AreYouSureModal>

    </div>

}