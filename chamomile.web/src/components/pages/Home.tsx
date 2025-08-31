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
import { useLocation, useNavigate } from "react-router-dom";

export default function Home() {

    const { vertical, height } = useWindowDimensions();
    const { queue, progress } = useQueue(() => { })
    const { album, setAlbum } = usePrompt();
    const { albums } = useAlbums();
    const { refresh: refreshAlbums } = useAlbums();
    const setTitle = usePageTitle();
    const location = useLocation();
    const nav = useNavigate();

    useEffect(() => {
        if (location.pathname.startsWith("/album/")) {
            const id = Number.parseInt(location.pathname.replace("/album/", ""));
            if (album?.id !== id) {
                setAlbum(albums?.find(a => a.id === id))
                setFilter({ ...filter, album: id })
            }
        } else {
            setAlbum(undefined)
            setFilter({ ...filter, album: -1 })
        }
    }, [location, albums])
    const albumsOpen = location.pathname === "/album/"

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

        <Navbar />

        <div style={{ display: "flex", flexDirection: 'column', width: "100%", flex: 1, padding: "0px 5%", overflowY: "hidden" }}>

            {albumsOpen ? <>
                <div style={{ flex: "1", overflowY: 'auto', width: "100%", marginBottom: "20px" }}>
                    <AlbumsViewer onClick={(val) => { setAlbum(val); setFilter({ ...filter, album: val?.id ?? -1 }); nav(`/album/${val?.id}`) }} />
                </div>
            </> : <>

                {album && <>
                    <div style={{ width: "100%", }}>
                        <AlbumHeader onBack={() => {
                            nav("/album/")
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
                        <PromptBuilder filter={filter} setFilter={setFilter} />
                    </div>

                    {!selectMode && <FilterBuilder
                        filter={filter} setFilter={setFilter} setAlbum={setAlbum}
                    />}
                </div>

                {/* Upload progress panel */}
                <UploadPanel />

                {/* Image viewer */}
                <ImageViewer key={album?.id} setFilter={setFilter}
                    showBrewing filter={filter} showWelcome
                    album={album} setAlbum={(val) => {
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
