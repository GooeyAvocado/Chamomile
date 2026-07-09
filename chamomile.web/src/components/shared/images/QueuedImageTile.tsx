import { CardActionArea, Typography } from "@mui/material";
import { Prompt } from "../../../model/Prompt";
import { useState } from "react";
import BaseImageTile from "./BaseImageTile";
import ContextMenu from "../ContextMenu";
import { AcUnit, Cancel, Whatshot } from "@mui/icons-material";
import { imageUrl } from "../../../api/Images";
import PromptOrderedModal from "../prompt/PromptOrderedModal";

export default function QueuedImageTile(props: {
    prompt: Prompt
    onCancel: () => void
    onRush: () => void
    onDelay: () => void
    onView?: (id: number) => void
    tiny?: boolean
}) {

    const { prompt, onCancel, onRush, onDelay, onView, tiny } = props;
    const [previewOpen, setPreviewOpen] = useState(false);

    return <ContextMenu options={[
        { icon: <Whatshot />, text: "Rush Order", onClick: onRush },
        { icon: <AcUnit />, text: "Delay Order", onClick: onDelay },
        { type: "divider" },
        { icon: <Cancel />, text: "Cancel", onClick: onCancel }
    ]}>
        <BaseImageTile>
            <CardActionArea onClick={() => { setPreviewOpen(true) }} style={{ height: "100%", position: "relative" }}>

                {prompt?.orderData && prompt?.orderData?.sample > 0 ?
                    <img src={imageUrl(prompt?.orderData.sample)}
                        style={{
                            width: "100%", height: "100%", objectFit: 'cover',
                            objectPosition: 'center top', position: 'absolute',
                            left: '0', top: '0', opacity: tiny ? "0.6" : '0.3'
                        }} />
                    : <img src={'/outline.png'} style={{
                        width: "50%", height: "50%", objectFit: 'cover',
                        objectPosition: 'center top', position: 'absolute',
                        left: '0', top: '0', margin: '25%', opacity: '0.6'
                    }} />
                }

                {!tiny && <Typography sx={{
                    width: "100%",
                    heigh: '100%',
                    fontFamily: 'monospace',
                    fontSize: '.7em',
                    padding: '10px',
                    textOverflow: 'ellipsis',
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 10,
                    overflow: "hidden",
                    zIndex: 1

                }} >
                    <div>{prompt.positivePrompt}</div>
                </Typography>}
            </CardActionArea>

            <PromptOrderedModal
                jobId={prompt?.id ?? 0}
                onCancel={() => {
                    onCancel();
                    setPreviewOpen(false);
                }}
                open={previewOpen}
                setOpen={setPreviewOpen}
                onViewImage={onView}
                prompt={prompt}
                onDelay={() => {
                    onDelay();
                    setPreviewOpen(false);
                }}
                onRush={() => {
                    onRush();
                    setPreviewOpen(false);
                }}
            />
        </BaseImageTile>
    </ContextMenu>


}