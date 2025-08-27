import { useEffect, useState } from "react";
import FilterBuilder from "../shared/filter/FilterBuilder";
import ImageViewer from "../shared/images/ImageViewer";
import PromptBuilder from "../shared/prompt/PromptBuilder";
import UploadPanel from "../shared/upload/UploadPanel";
import { FilterOptions } from "../../model/FilterOptions";
import { useWindowDimensions } from "../hooks/useWindowDimensions";
import { useQueue } from "../hooks/useQueue";
import { usePageTitle } from "../hooks/useTitle";
import AlbumsViewer from "../shared/albums/AlbumsViewer";
import AlbumHeader from "../shared/albums/AlbumHeader";
import { usePrompt } from "../hooks/usePrompt";
import Navbar from "../shared/navbar/Navbar";
import { useAlbums } from "../hooks/useAlbums";

export default function Home() {

    const { vertical, height } = useWindowDimensions();
    const { queue, progress } = useQueue(() => { })
    const { album, setAlbum } = usePrompt();
    const { refresh: refreshAlbums } = useAlbums();
    const setTitle = usePageTitle();

    const initialFilter = {
        favorite: false,
        album: -1,
        lora: "",
        model: "",
        query: "",
        fromDate: "",
        lastImage: 0,
        toDate: ""
    } as FilterOptions

    const [filter, setFilter] = useState(initialFilter)
    const [albumsOpen, setAlbumsOpen] = useState(false)
    const [selectedImages, setSelectedImages] = useState<number[]>([])
    const [selectMode, setSelectMode] = useState(false)

    const selectImage = (id: number) => {
        if (!selectMode) setSelectMode(true);
        setSelectedImages([...selectedImages, id])
    }

    const unselectImage = (id: number) => {
        const newImgs = selectedImages.filter(a => a !== id);
        setSelectedImages(newImgs)
        if (newImgs.length === 0) setSelectMode(false)
    }

    const onClearSelect = () => {
        setSelectedImages([])
        setSelectMode(false)
    }

    useEffect(() => {
        let subtitle = "";
        if (progress) subtitle = subtitle + `${(progress.progress * 100).toFixed(0)}%`
        if (queue.length > 0) subtitle = subtitle + ` (${queue.length} pending)`
        setTitle(subtitle)
    }, [queue, progress])

    return <div style={{
        height: vertical || height < 768 ? undefined : "100vh",
        overflow: 'hidden', display: "flex",
        flexDirection: "column", alignItems: 'center',
        margin: "0 auto"
    }}>

        {/* Header */}

        <Navbar
            navAlbums={() => {
                setAlbumsOpen(!albumsOpen)
                refreshAlbums();
            }}
            navBrew={() => {
                if (albumsOpen || album) {
                    setFilter(initialFilter)
                }
                setAlbumsOpen(false)
                setAlbum(undefined);

            }}
        />

        <div style={{ display: "flex", flexDirection: 'column', width: "100%", flex: 1, padding: "0px 5%", overflowY: "hidden" }}>

            {albumsOpen ? <>
                <div style={{ flex: "1", overflowY: 'auto', width: "100%", marginBottom: "20px" }}>
                    <AlbumsViewer onClick={(val) => { setAlbum(val); setFilter({ ...filter, album: val?.id ?? -1 }); setAlbumsOpen(false) }} />
                </div>
            </> : <>

                {album && <>
                    <div style={{ width: "100%", }}>
                        <AlbumHeader onBack={() => {
                            setAlbumsOpen(true)
                            refreshAlbums();
                        }}
                            album={album} setAlbum={(val) => {
                                setAlbum(val)
                                if (!val) setFilter({ ...filter, album: -1 })
                                else if (val.id !== filter.album) setFilter({ ...filter, album: val.id })
                            }} />
                    </div>
                    <hr style={{ width: "100%" }} />
                </>}

                <div style={{ marginBottom: '5px', width: "100%", marginTop: "15px", display: "flex", flexDirection: "column", gap: "15px" }}>
                    <div style={{ width: "100%" }}>
                        <PromptBuilder />
                    </div>

                    {!selectMode && <FilterBuilder
                        filter={filter} setFilter={setFilter} setAlbum={setAlbum}
                    />}
                </div>

                {/* Upload progress panel */}
                <UploadPanel />

                {/* Image viewer */}
                <ImageViewer key={album?.id} showBrewing filter={filter} showWelcome album={album} setAlbum={(val) => {
                    setAlbum(val)
                    setFilter({ album: val.id })
                }}
                    onClearSelect={onClearSelect} setSelectedImages={setSelectedImages}
                    selectImage={selectImage} selectedImages={selectedImages} selectMode={selectMode} unselectImage={unselectImage}
                />

            </>}
        </div>

    </div>
}
