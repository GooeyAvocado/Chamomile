import { LinearProgress } from "@mui/material";
import { useImageUpload } from "../../hooks/useImageUpload";

export default function UploadPanel(){

    const {files,overallProgress,progress, uploadIndex} = useImageUpload();
    
    if(uploadIndex===-1) return <></>

    return <div style={{width:"100%", marginBottom:'20px'}}>
         <div>
            Overall Progress ({uploadIndex}/{files?.length ?? 0})
            <LinearProgress value={overallProgress ?? 0} variant="determinate"/>
        </div>
        <div style={{marginTop:"10px"}}>
            Current File Upload
            <LinearProgress value={progress} variant="determinate"/>
        </div>
        <hr/>
    </div>

}