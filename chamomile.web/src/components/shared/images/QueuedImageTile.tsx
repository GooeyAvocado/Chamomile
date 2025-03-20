import { CardActionArea, Typography } from "@mui/material";
import { Prompt } from "../../../model/Prompt";
import { useState } from "react";
import PromptEditorModal from "../prompt/PromptEditorModal";
import BaseImageTile from "./BaseImageTile";
import ContextMenu from "../ContextMenu";
import { Cancel } from "@mui/icons-material";

export default function QueuedImageTile(props: {
    prompt: Prompt
    onCancel: () => void
}) {

    const { prompt, onCancel } = props;
    const [previewOpen,setPreviewOpen] = useState(false);

    return <ContextMenu options={[{icon:<Cancel/>, text:"Cancel", onClick:onCancel}]}>
        <BaseImageTile>
        <CardActionArea onClick={() => {setPreviewOpen(true)}} style={{ height: "100%", position: "relative" }}>
            <img src={'/outline.png'} style={{ width: "50%", height: "50%", objectFit: 'cover', objectPosition: 'center top', position: 'absolute', left: '0', top: '0', margin: '25%', opacity: '0.6' }} />
            <Typography sx={{
                width: "100%",
                heigh:'100%',
                fontFamily:'monospace',
                fontSize:'.7em',
                padding:'10px',
                textOverflow:'ellipsis',
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 10,
                overflow: "hidden",

            }} >
                <div>{prompt.positivePrompt}</div>
            </Typography>
        </CardActionArea>
        <PromptEditorModal title={`Order ${prompt.id}`} open={previewOpen} onOk={()=>{
            onCancel();
            setPreviewOpen(false);
        }} prompt={prompt} setOpen={setPreviewOpen} preview cancelable/>
    </BaseImageTile>
    </ContextMenu>


}