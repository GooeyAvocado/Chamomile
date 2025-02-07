import { CardActionArea, LinearProgress } from "@mui/material";
import BaseImageTile from "./BaseImageTile";

export default function BrewingImageTile(props:{
    imageSrc : string
    progress: number,
    onClick?: ()=>void
    eta?: number
}){

    const {imageSrc, onClick, progress,eta} = props;

    return <BaseImageTile>
                <CardActionArea onClick={onClick} style={{height:"100%", position:"relative"}}>
                    {imageSrc.length > 0 && <img src={imageSrc} style={{width:"100%", height:"100%", objectFit:'cover', objectPosition:'center top', position:'absolute', left:'0', top:'0'}}/>}
                    <div style={{position:"absolute", left:0, top:0, width:"100%", height:"100%", background:"rgba(128,128,128,0.5)", display:"flex", flexDirection:"column", justifyContent:'center', alignItems:'center'}}>
                        <img src="/brewing.gif" style={{width:'100%', opacity:'.7', objectFit:'contain'}}/>
                    </div>
                    <div style={{position:"absolute", left:0, top:0, width:"100%", height:"100%", display:"flex", flexDirection:"column", justifyContent:'flex-end', alignItems:'center'}}>
                        <div style={{textAlign:'left', width:'100%', marginBottom:'2px', fontSize:'.8em'}}>{progress.toFixed(0)}% {eta ? `(${eta < 1 ? '<1' : eta.toFixed(0)}s)` : ''}</div>
                        <LinearProgress value={progress} variant="determinate" style={{width:"100%"}}/>
                    </div>
                </CardActionArea>
            </BaseImageTile>


}