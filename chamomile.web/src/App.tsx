import { useEffect, useState } from "react";
import FilterBuilder from "./components/shared/filter/FilterBuilder";
import ImageViewer from "./components/shared/images/ImageViewer";
import PromptBuilder from "./components/shared/prompt/PromptBuilder";
import UploadPanel from "./components/shared/upload/UploadPanel";
import { FilterOptions } from "./model/FilterOptions";
import ChamomileLogo from "./components/shared/ChamomileLogo";
import { useWindowDimensions } from "./components/hooks/useWindowDimensions";
import { useQueue } from "./components/hooks/useQueue";
import { usePageTitle } from "./components/hooks/useTitle";

export default function App() {

  const [filter, setFilter] = useState({
    favorite: false,
    lora: "",
    model: "",
    query: ""
  } as FilterOptions)

  const {queue,progress} = useQueue(()=>{})
  const setTitle = usePageTitle();

  useEffect(()=>{
    let subtitle = "";
    if(progress) subtitle = subtitle + `${(progress.progress*100).toFixed(0)}%`
    if(queue.length > 0) subtitle = subtitle + ` (${queue.length} pending)`
    setTitle(subtitle)
  },[queue,progress])
  

  const { vertical } = useWindowDimensions();

  return <div style={{ height: vertical ? undefined : "100vh", width: "80vw", maxWidth: "1400px", overflow: 'hidden', display: "flex", flexDirection: "column", alignItems: 'center', margin: "0 auto", paddingTop: "20px" }}>
    <ChamomileLogo />
    <div style={{ width: "100%", marginTop: "20px" }}>
      <PromptBuilder />
    </div>
    <hr style={{ width: "100%" }} />
    <FilterBuilder filter={filter} setFilter={setFilter} />
    <hr style={{ width: "100%" }} />
    <UploadPanel />
    <div style={{ flex: "1", overflowY: 'auto', width: "100%", marginBottom: "20px" }}>
      <ImageViewer filter={filter} showBrewing showWelcome showQueueSnackbars/>
    </div>
  </div>
}