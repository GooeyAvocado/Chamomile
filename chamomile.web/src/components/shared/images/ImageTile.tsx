import { GeneratedImage } from "../../../model/GeneratedImage";
import { CardActionArea } from "@mui/material";
import { imageUrl } from "../../../api/Images";
import BaseImageTile from "./BaseImageTile";
import ContextMenu from "../ContextMenu";
import { CoffeeOutlined, Delete, Star, StarOutline, Terminal, TerminalOutlined } from "@mui/icons-material";
import PromptReorderButton from "../prompt/PromptReorderButton";
import { imageToPrompt } from "../Utils";
import { usePrompt } from "../../hooks/usePrompt";
import { useState } from "react";
import AreYouSureModal from "../modals/AreYouSureModal";

export default function ImageTile(props: {
    image: GeneratedImage
    onClick: () => void
    onFavorite: (val?: GeneratedImage) => void,
    onDelete: (val?: GeneratedImage) => void,
}) {

    const { image, onClick, onDelete, onFavorite } = props;
    const { setPrompt } = usePrompt();

    const [deleteAys, setDeleteAys] = useState(false)

    return <>
        <ContextMenu options={[
            { text: image.favorite ? "Unfavorite" : "Favorite", icon: image.favorite ? <Star htmlColor="gold" /> : <StarOutline />, onClick: () => { onFavorite(image) } },
            { type: "divider" },
            { type: "custom", customContent: (onClose) => <PromptReorderButton prompt={imageToPrompt(image)} menuButonMode onClick={onClose} /> },
            { type: "custom", customContent: (onClose) => <PromptReorderButton prompt={imageToPrompt(image, true)} iconOverride={<CoffeeOutlined />} menuButonMode onClick={onClose} textSuffix="(base prompt)" disabled={(image.basePrompt?.trim()?.length ?? 0) === 0} /> },
            { type: "divider" },
            { text: "Use this prompt", icon: <Terminal />, onClick: () => { setPrompt(imageToPrompt(image)) } },
            { text: "Use this base prompt", icon: <TerminalOutlined />, onClick: () => { setPrompt(imageToPrompt(image, true)) }, disabled: (image.basePrompt?.trim()?.length ?? 0) === 0 },
            { type: "divider" },
            { text: "Delete", icon: <Delete />, onClick: () => { setDeleteAys(true) } },
        ]}>
            <BaseImageTile>
                <CardActionArea onClick={onClick} style={{ height: "100%", width: "100%", aspectRatio: "1/1", position: "relative" }}>
                    <img src={'/outline.png'} style={{ width: "50%", height: "50%", objectFit: 'cover', objectPosition: 'center top', position: 'absolute', left: '0', top: '0', margin: '25%' }} />
                    <img src={imageUrl(image.id)} style={{ width: "100%", height: "100%", objectFit: 'cover', objectPosition: 'center top', position: 'absolute', left: '0', top: '0' }} />
                    {image.favorite && <div style={{ position: 'absolute', top: 7, left: 7, opacity: "0.3" }}><Star htmlColor="black" /></div>}
                    {image.favorite && <div style={{ position: 'absolute', top: 5, left: 5 }}><Star htmlColor="gold" /></div>}
                </CardActionArea>
            </BaseImageTile>
        </ContextMenu>

        {deleteAys && <AreYouSureModal open={deleteAys} setOpen={setDeleteAys} title="Delete this image?" onYes={() => {
            onDelete(image)
            setDeleteAys(false);
        }}>
            <div style={{ textAlign: 'center' }}><img src={imageUrl(image.id)} style={{ height: "256px" }} /></div>
        </AreYouSureModal>}
    </>


}