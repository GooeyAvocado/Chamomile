import { CardActionArea, Typography } from "@mui/material";
import { Prompt } from "../../../model/Prompt";
import { useState } from "react";
import BaseImageTile from "./BaseImageTile";
import ContextMenu from "../ContextMenu";
import { Cancel } from "@mui/icons-material";
import PromptGroupModal from "../prompt/PromptGroupModal";

export default function QueuedGroupImageTile(props: {
    prompts: Prompt[]
    onCancel: (id: number) => void
}) {

    const { prompts, onCancel } = props;
    const [previewOpen, setPreviewOpen] = useState(false);

    const cancelAll = () => {
        prompts.forEach(a => onCancel(a.id))
    }

    return <ContextMenu options={[
        {icon:<Cancel/>, text:"Cancel All", onClick: ()=> cancelAll()}
    ]} style={{ position: 'relative', width:"100%", aspectRatio:1 }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: '80%' }}>
            <BaseImageTile>
                <div style={{ padding: "5px", fontSize: '.9em', fontFamily: 'monospace' }}>x{prompts.length}</div>
            </BaseImageTile>
        </div>
        <div style={{ position: "absolute", width: '100%', height: "100%", zIndex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: "80%" }}>
                <BaseImageTile>
                    <CardActionArea onClick={() => { setPreviewOpen(true) }} style={{ height: "100%", position: "relative" }}>
                        <img src={'/outline.png'} style={{ width: "50%", height: "50%", objectFit: 'cover', objectPosition: 'center top', position: 'absolute', left: '0', top: '0', margin: '25%', opacity: '0.6' }} />
                        <Typography sx={{
                            width: "100%", heigh: '100%',
                            fontFamily: 'monospace', fontSize: '.7em',
                            padding: '10px', textOverflow: 'ellipsis',
                            display: "-webkit-box", WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 10, overflow: "hidden",

                        }} >
                            <div>{prompts[0].positivePrompt}</div>
                        </Typography>
                    </CardActionArea>
                    <PromptGroupModal prompts={prompts} onCancel={onCancel} onCancelAll={cancelAll} open={previewOpen} setOpen={setPreviewOpen}/>
                </BaseImageTile>
            </div>
        </div>
        <div style={{ position: "absolute", bottom: 0, right: 0, width: '80%' }}><BaseImageTile /></div>
    </ContextMenu>

}