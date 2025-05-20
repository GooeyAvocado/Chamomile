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

export default function Home() {

  const [filter, setFilter] = useState({
    favorite: false,
    lora: "",
    model: "",
    query: "",
    fromDate: "",
    lastImage: 0,
    toDate: ""
  } as FilterOptions)

  const {queue,progress} = useQueue(()=>{})
  const setTitle = usePageTitle();

  useEffect(()=>{
    let subtitle = "";
    if(progress) subtitle = subtitle + `${(progress.progress*100).toFixed(0)}%`
    if(queue.length > 0) subtitle = subtitle + ` (${queue.length} pending)`
    setTitle(subtitle)
  },[queue,progress])
  

  const { vertical, height, width } = useWindowDimensions();

  return <div style={{ height: vertical || height < 768 ? undefined : "100vh", width: "80vw", maxWidth: "1400px", overflow: 'hidden', display: "flex", flexDirection: "column", alignItems: 'center', margin: "0 auto", paddingTop: "20px" }}>
    <div style={{display:'flex', justifyContent:"space-between", width:"100%", alignItems:"end"}}>
      <ChamomileLogo hideWords={width < 450}/>
      <div style={{display:'flex', gap:"10px"}}>
        <DisplayButton/>
        <HelpButton/>
      </div>
    </div>
    <hr style={{width:"100%"}}/>
    <div style={{ width: "100%", marginTop: "10px" }}>
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