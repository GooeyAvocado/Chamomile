import { IconButton, Tooltip } from "@mui/material";
import { Album } from "../../../model/Album";
import { ArrowBack, CheckCircle, Delete, Edit, Info, VisibilityOff } from "@mui/icons-material";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import { useState } from "react";
import useApi from "../../hooks/useApi";
import { deleteAlbum } from "../../../api/Albums";
import AreYouSureModal from "../modals/AreYouSureModal";
import { useSnackbar } from "notistack";
import AlbumEditor from "./AlbumEditor";

export default function AlbumHeader({ album, setAlbum, style, forceVertical, onBack }: {
    album: Album
    setAlbum: (val: Album | undefined) => void
    style?: React.CSSProperties
    forceVertical?: boolean
    onBack?: () => void
}) {

    const { vertical: windowDimVertical } = useWindowDimensions();
    const vertical = windowDimVertical || forceVertical
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

    return <div style={{
        display: "flex", paddingTop: "16px", gap: "16px", flex: "1 0",
        flexDirection: vertical ? "row" : undefined, ...style
    }}>

        {/* <Card elevation={10} style={{ height: `${64 + 16}px`, maxWidth: "350px", alignSelf: 'center' }}>
            <AlbumThumbImg album={album} />
        </Card> */}

        <div style={{ display: 'flex', flexDirection: 'column', flex: "1", height: "100%" }}>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: "8px" }}>

                {/* Header */}
                <div style={{
                    fontFamily: 'Merriweather', fontSize: "1.5em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    display: 'flex', gap: "10px", alignItems: "center"
                }}>
                    {onBack && <IconButton size="small" onClick={onBack}><ArrowBack /></IconButton>}
                    {album.hideFromTimeline && <Tooltip title="Images on this album are hidden on the timeline">
                        <VisibilityOff fontSize="inherit" />
                    </Tooltip>}
                    {album.name}
                </div>

                {/* Middle Section */}
                <div style={{ display: 'flex', gap: "8px", flex: "1", alignSelf: "center" }}>

                    {album.searchQuery?.trim().length === 0
                        ? <Tooltip title="Images are not being automatically added to this album">
                            <Info color="info" fontSize="inherit" />
                        </Tooltip>
                        : <Tooltip title={album.searchQuery}>
                            <CheckCircle color="success" fontSize="inherit" />
                        </Tooltip>
                    }

                </div>

                {/* End Section */}
                <div style={{ display: 'flex', gap: "20px" }}>

                    {!vertical && (album.count ?? 0) > 2 &&
                        <div style={{ fontSize: ".8em", textAlign: "right", flex: "1, 0" }}>
                            {/* This just looks cleaner. I pity the soul that makes an album with exactly one image */}
                            <div style={{ fontSize: ".8em" }}>{album.count} Images</div>
                            <div>{new Date(album.oldest ?? "").toLocaleDateString()} - {new Date(album.newest ?? "").toLocaleDateString()}</div>
                        </div>
                    }

                    <div style={{ display: 'flex', gap: "8px" }}>
                        <IconButton onClick={() => setEditorOpen(true)}><Edit fontSize="small" /></IconButton>
                        <IconButton onClick={() => setAys(true)}><Delete fontSize="small" /></IconButton>
                    </div>
                </div>

            </div>


        </div>

        <AlbumEditor open={editorOpen} setOpen={(val, result) => {
            setEditorOpen(val)
            if (result) setAlbum({ ...album, name: result.name, searchQuery: result.searchQuery, hideFromTimeline: result.hideFromTimeline })
        }} album={album} />

        <AreYouSureModal onYes={onDelete} open={ays} setOpen={setAys} loading={delApi.loading} title="Are you sure you want to delete this collection?">
            This will not delete any images
        </AreYouSureModal>

    </div>

}