import { GeneratedImage } from "../../../model/GeneratedImage";
import { CardActionArea, CircularProgress, useTheme } from "@mui/material";
import { imageUrl } from "../../../api/Images";
import BaseImageTile from "./BaseImageTile";
import ContextMenu from "../ContextMenu";
import { CheckBox, CheckBoxOutlineBlank, CoffeeOutlined, Delete, Download, Gradient, ReceiptLong, ReceiptLongTwoTone, Star, StarOutlineOutlined } from "@mui/icons-material";
import PromptReorderButton from "../prompt/PromptReorderButton";
import { downloadImage, imageToPrompt } from "../Utils";
import { usePrompt } from "../../hooks/usePrompt";
import { useEffect, useRef, useState } from "react";
import AreYouSureModal from "../modals/AreYouSureModal";
import { FilterOptions } from "../../../model/FilterOptions";
import ImageMoreFromMenu from "./ImageMoreFromMenu";
import { useUpscalers } from "../../hooks/useUpscalers";

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
    onUpscale?: (val: GeneratedImage) => void,
    onDownload?: () => void
    lazyLoad?: boolean
    highlighted?: boolean
    modalOpen?: boolean
}) {

    const {
        image, onClick, onDelete, onFavorite,
        onSelect, selectMode, selected, onUnselect,
        filter, setFilter, lazyLoad, onDownload, onUpscale,
        highlighted, modalOpen
    } = props;

    const { setPrompt } = usePrompt();
    const canSelect = onSelect && onUnselect

    const { onUpscale: upscaleImage, imageUpscalingId, upscaleLoading } = useUpscalers();
    const [deleteAys, setDeleteAys] = useState(false)
    const theme = useTheme();
    const primaryColor = theme.palette.primary;

    const ref = useRef<any>(null);

    useEffect(() => {
        if (highlighted) {
            ref.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [ref, modalOpen])

    return <>
        <ContextMenu options={[
            canSelect ? { text: selected ? "Unselect" : "Select", icon: selected ? <CheckBox /> : <CheckBoxOutlineBlank />, onClick: selected ? onUnselect : onSelect } : undefined,
            canSelect ? { type: "divider" } : undefined,
            { text: image.favorite ? "Unfavorite" : "Favorite", icon: image.favorite ? <Star htmlColor="gold" /> : <StarOutlineOutlined />, onClick: () => { onFavorite(image) }, disabled: selectMode },
            {
                text: (image?.downloadCount ?? 0) > 0 ? "Download again" : "Download",
                icon: <Download color={(image?.downloadCount ?? 0) > 0 ? "primary" : undefined} />,
                onClick: () => {
                    downloadImage(image)
                    onDownload?.()
                }
            },
            {
                text: imageUpscalingId === image.id ? "Upscaling..." : image.hiResAvailable ? "Upscale again" : "Upscale",
                icon: imageUpscalingId === image.id ? <CircularProgress size={24} color="info" /> : <Gradient color={image.hiResAvailable ? "info" : undefined} />,
                disabled: upscaleLoading,
                onClick: () => {
                    upscaleImage(image, onUpscale)
                }
            },
            { type: "divider" },
            filter && setFilter ? {
                type: "custom",
                customContent: () => <ImageMoreFromMenu
                    filter={filter} setFilter={setFilter}
                    image={image}
                />
            } : undefined,
            filter && setFilter ? { type: "divider" } : undefined,
            {
                type: "custom", customContent: (onClose) => <PromptReorderButton
                    prompt={imageToPrompt(image)} source="IMAGE"
                    sample={(image?.additionalInfo?.sample ?? 0) > 0 ? image?.additionalInfo?.sample : image?.id}
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
                transform: `scale(${selectMode
                    ? (selected ? 0.9 : 0.8)
                    : highlighted && modalOpen ? 2 : 1})`,
                opacity: selectMode ? selected ? 1 : .5 : 1,
                padding: highlighted ? "2px" : "0", backgroundColor: highlighted ? primaryColor.main : undefined,
                transition: `transform ${selectMode ? "0.1s" : ".2s"} ease, opacity 0.1s ease, padding 0.1s ease`,
                zIndex: highlighted ? 2 : 0
            }}>
                <CardActionArea ref={ref} onClick={(e) => {
                    if ((selectMode || e.shiftKey) && canSelect) {
                        if (selected) onUnselect()
                        else onSelect()
                    }
                    else onClick()
                }} style={{ height: "100%", width: "100%", aspectRatio: "1/1", position: "relative" }}>
                    <img src={'/outline.png'} style={{ width: "50%", height: "50%", objectFit: 'cover', objectPosition: 'center top', position: 'absolute', left: '0', top: '0', margin: '25%' }} />
                    <img
                        loading={lazyLoad ? "lazy" : undefined} src={imageUrl(image.id)}
                        style={{ width: "100%", height: "100%", objectFit: 'cover', objectPosition: 'center top', position: 'absolute', left: '0', top: '0' }}
                    />
                    {imageUpscalingId === image.id && <div style={{
                        width: "100%", height: "100%",
                        objectFit: 'cover', objectPosition: 'center top',
                        position: 'absolute', left: '0', top: '0',
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <CircularProgress size={36} color="info" />
                    </div>}
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
            <div style={{ textAlign: 'center' }}><img src={imageUrl(image.id)} style={{
                height: "256px",
                width: "384px",
                objectFit: "contain"
            }} /></div>
        </AreYouSureModal>}
    </>


}