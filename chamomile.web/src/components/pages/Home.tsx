import { useEffect, useState } from "react";
import FilterBuilder from "../shared/filter/FilterBuilder";
import ImageViewer from "../shared/images/ImageViewer";
import PromptBuilder from "../shared/prompt/PromptBuilder";
import UploadPanel from "../shared/upload/UploadPanel";
import { FilterOptions } from "../../model/FilterOptions";
import ChamomileLogo from "../shared/ChamomileLogo";
import { useWindowDimensions } from "../hooks/useWindowDimensions";
import { useQueue } from "../hooks/useQueue";
import { usePageTitle } from "../hooks/useTitle";
import DisplayButton from "../shared/display/DisplayButton";
import HelpButton from "../shared/help/HelpButton";
import StatsButton from "../shared/StatsButton/StatsButton";
import { Album } from "../../model/Album";
import AlbumButton from "../shared/albums/AlbumButton";
import AlbumsViewer from "../shared/albums/AlbumsViewer";
import AlbumHeader from "../shared/albums/AlbumHeader";
import GenerationsButton from "../shared/albums/GenerationsButton";
import { useAlbums } from "../hooks/useAlbums";

export default function Home() {

  const [album, setAlbum] = useState(undefined as Album | undefined);
  const [albumsOpen, setAlbumsOpen] = useState(false)

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

  const { queue, progress } = useQueue(() => { })
  const { refresh: refreshAlbums } = useAlbums();
  const setTitle = usePageTitle();

  useEffect(() => {
    let subtitle = "";
    if (progress) subtitle = subtitle + `${(progress.progress * 100).toFixed(0)}%`
    if (queue.length > 0) subtitle = subtitle + ` (${queue.length} pending)`
    setTitle(subtitle)
  }, [queue, progress])


  const { vertical, height, width } = useWindowDimensions();

  return <div style={{ height: vertical || height < 768 ? undefined : "100vh", width: "80vw", maxWidth: "1400px", overflow: 'hidden', display: "flex", flexDirection: "column", alignItems: 'center', margin: "0 auto", paddingTop: "20px" }}>
    <div style={{ display: 'flex', justifyContent: "space-between", width: "100%", alignItems: "end" }}>
      <ChamomileLogo hideWords={width < (450 + 120 + 2 + 40)} />
      <div style={{ display: 'flex', gap: "10px" }}>
        {(albumsOpen || album) && <GenerationsButton onClick={() => {
          setAlbumsOpen(false)
          setAlbum(undefined);
          setFilter(initialFilter)
        }} />}
        {!albumsOpen && <AlbumButton onClick={() => {
          setAlbumsOpen(!albumsOpen)
          refreshAlbums();
        }} />}
        <StatsButton filter={filter} />
        <hr />
        <DisplayButton />
        <HelpButton />
      </div>
    </div>
    <hr style={{ width: "100%" }} />

    {albumsOpen ? <>
      <div style={{ flex: "1", overflowY: 'auto', width: "100%", marginBottom: "20px" }}>
        <AlbumsViewer onClick={(val) => { setAlbum(val); setFilter({ ...filter, album: val?.id ?? -1 }); setAlbumsOpen(false) }} />
      </div>
    </> : <>

      {album ? <>
        <div style={{ width: "100%" }}>
          <AlbumHeader album={album} setAlbum={(val) => {
            setAlbum(val)
            if (!val) setFilter({ ...filter, album: -1 })
            else if (val.id !== filter.album) setFilter({ ...filter, album: val.id })
          }} />
        </div>
        <hr style={{ width: "100%" }} />
      </> : <>
        <div style={{ width: "100%", marginTop: "10px" }}>
          <PromptBuilder />
        </div>
        <hr style={{ width: "100%" }} />
      </>}

      <FilterBuilder filter={filter} setFilter={setFilter} setAlbum={setAlbum} />
      <hr style={{ width: "100%" }} />

      <UploadPanel />
      <div style={{ flex: "1", overflowY: 'auto', width: "100%", marginBottom: "20px" }}>
        <ImageViewer key={album?.id} filter={filter} showBrewing={!album} showWelcome showQueueSnackbars album={album} setAlbum={(val) => {
          setAlbum(val)
          setFilter({ album: val.id })
        }} />
      </div>
    </>}
  </div>
}