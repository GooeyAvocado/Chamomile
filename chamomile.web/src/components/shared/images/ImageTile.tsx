import { GeneratedImage } from "../../../model/GeneratedImage";
import { CardActionArea } from "@mui/material";
import { imageUrl } from "../../../api/Images";
import BaseImageTile from "./BaseImageTile";
import ContextMenu from "../ContextMenu";
import { CheckBox, CheckBoxOutlineBlank, CoffeeOutlined, Delete, Gradient, ReceiptLong, ReceiptLongTwoTone, Star, StarOutline, TravelExplore } from "@mui/icons-material";
import PromptReorderButton from "../prompt/PromptReorderButton";
import { imageToPrompt } from "../Utils";
import { usePrompt } from "../../hooks/usePrompt";
import { useState } from "react";
import AreYouSureModal from "../modals/AreYouSureModal";
import { FilterOptions } from "../../../model/FilterOptions";

export default function ImageTile(props: {
    image: GeneratedImage
    filter?: FilterOptions
    setFilter?: (val: FilterOptions) => void
    selected?: boolean
    selectMode?: boolean
    onSelect?: () => void
    onUnselect?: () => void
    onClick: () => void
    onFavorite: (val?: GeneratedImage) => void,
    onDelete: (val?: GeneratedImage) => void,
}) {

    const {
        image, onClick, onDelete, onFavorite,
        onSelect, selectMode, selected, onUnselect,
        filter, setFilter
    } = props;
    const { setPrompt } = usePrompt();
    const canSelect = onSelect && onUnselect

    const [deleteAys, setDeleteAys] = useState(false)

    return <>
        <ContextMenu options={[
            canSelect ? { text: selected ? "Unselect" : "Select", icon: selected ? <CheckBox /> : <CheckBoxOutlineBlank />, onClick: selected ? onUnselect : onSelect } : undefined,
            { text: image.favorite ? "Unfavorite" : "Favorite", icon: image.favorite ? <Star htmlColor="gold" /> : <StarOutline />, onClick: () => { onFavorite(image) }, disabled: selectMode },
            { type: "divider" },
            filter && setFilter ? { text: "More like this", icon: <TravelExplore />, onClick: () => { setFilter({ ...filter, sample: image.additionalInfo?.sample }) }, disabled: (image.additionalInfo?.sample ?? -1) <= 0 } : undefined,
            { type: "divider" },
            {
                type: "custom", customContent: (onClose) => <PromptReorderButton
                    prompt={imageToPrompt(image)} source="IMAGE"
                    // sample={(image?.additionalInfo?.sample ?? 0) > 0 ? image?.additionalInfo?.sample : image?.id}
                    sample={image?.additionalInfo?.sample}
                    menuButonMode onClick={onClose} disabled={selectMode}
                />
            },
            {
                type: "custom", customContent: (onClose) => <PromptReorderButton
                    prompt={imageToPrompt(image, true)} source="IMAGE_BASE"
                    sample={(image?.additionalInfo?.sample ?? 0) > 0 ? image?.additionalInfo?.sample : image?.id} iconOverride={<CoffeeOutlined />}
                    menuButonMode onClick={onClose} textSuffix="(base prompt)"
                    disabled={selectMode || (image.basePrompt?.trim()?.length ?? 0) === 0 || image?.basePrompt === image?.prompt}
                />
            },
            { type: "divider" },
            { text: "Use this prompt", icon: <ReceiptLong />, onClick: () => { setPrompt(imageToPrompt(image)) }, disabled: selectMode },
            { text: "Use this base prompt", icon: <ReceiptLongTwoTone />, onClick: () => { setPrompt(imageToPrompt(image, true)) }, disabled: selectMode || (image.basePrompt?.trim()?.length ?? 0) === 0 || image.basePrompt === image.prompt },
            { type: "divider" },
            { text: "Delete", icon: <Delete />, onClick: () => { setDeleteAys(true) }, disabled: selectMode },
        ]}>
            <BaseImageTile style={{
                transform: `scale(${selectMode ? (selected ? 0.9 : 0.8) : 1})`,
                opacity: selectMode ? selected ? 1 : .5 : 1,
                transition: "transform 0.1s ease, opacity 0.1s ease"
            }}>
                <CardActionArea onClick={(e) => {
                    if ((selectMode || e.shiftKey) && canSelect) {
                        if (selected) onUnselect()
                        else onSelect()
                    }
                    else onClick()
                }} style={{ height: "100%", width: "100%", aspectRatio: "1/1", position: "relative" }}>
                    <img src={'/outline.png'} style={{ width: "50%", height: "50%", objectFit: 'cover', objectPosition: 'center top', position: 'absolute', left: '0', top: '0', margin: '25%' }} />
                    <img loading="lazy" src={imageUrl(image.id)} style={{ width: "100%", height: "100%", objectFit: 'cover', objectPosition: 'center top', position: 'absolute', left: '0', top: '0' }} />
                    <div style={{ position: 'absolute', top: 7, left: 7, opacity: "0.3", display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {image.favorite && <Star htmlColor="black" />}
                        {image.hiResAvailable && <Gradient htmlColor="black" />}
                    </div>
                    <div style={{ position: 'absolute', top: 5, left: 5, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {image.favorite && <Star htmlColor="gold" />}
                        {image.hiResAvailable && <Gradient color="info" />}
                    </div>
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