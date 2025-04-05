import { GeneratedImage } from "../../../model/GeneratedImage";
import { Card, Dialog, IconButton, Tab, Tabs, Tooltip } from "@mui/material";
import { imageUrl } from "../../../api/Images";
import { ArrowBack, ArrowForward, CoffeeOutlined, Delete, Star, StarBorder, Terminal, TerminalOutlined } from "@mui/icons-material";
import LoraCard from "../lora/LoraCard";
import ModelCard from "../model/ModelCard";
import { usePrompt } from "../../hooks/usePrompt";
import { useSnackbar } from "notistack";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import HiResPanel from "../upscaler/HiResPanel";
import PromptReorderButton from "../prompt/PromptReorderButton";
import { imageToPrompt } from "../Utils";
import { useEffect, useState } from "react";
import ImageHotbar from "./ImageHotbar";
import { Prompt } from "../../../model/Prompt";

export default function ImageModal(props: {
    image?: GeneratedImage,
    open: boolean,
    setOpen: (val: boolean) => void
    onFavorite?: () => void,
    onDelete?: () => void,
    onDeleteForce?: () => void,
    onLeft?: () => void,
    onRight?: () => void,
    onUpscale?: (val: GeneratedImage) => void
}) {

    const { image, open, setOpen, onDelete, onFavorite, onLeft, onRight, onDeleteForce, onUpscale } = props;

    const { setPrompt } = usePrompt();
    const { enqueueSnackbar } = useSnackbar();
    const { vertical } = useWindowDimensions()

    const [promptMode, setPromptMode] = useState(0)

    useEffect(() => {
        if ((image?.basePrompt?.trim()?.length ?? 0) === 0) setPromptMode(0)
    }, [image])

    const onUsePrompt = (promptOverride?:Prompt) => {
        setOpen(false)
        enqueueSnackbar("Prompt loaded!", { variant: 'success' })
        setPrompt(promptOverride ?? imageToPrompt(image, promptMode===1))
    }

    // window.open(imageUrl(image?.id ?? 0) + ".png");

    const saveImage = async () => {
        try {
            const a = document.createElement('a');
            a.href = imageUrl(image?.id ?? 0) + ".png";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

        } catch (error) {
            console.error('Error downloading the image:', error);
        }
    }

    return <Dialog open={open && !!image} onClose={() => setOpen(false)} fullScreen
        onKeyUp={(e) => {
            switch (e.key) {
                case "Delete":
                    if (e.shiftKey && onDeleteForce) { onDeleteForce?.() }
                    else { onDelete?.() }
                    break;
                default:
                    break;
            }
        }}
        onKeyDown={(e) => {
            switch (e.key) {
                case "ArrowLeft":
                    onLeft?.()
                    break;
                case "ArrowRight":
                    onRight?.();
                    break;
                case "s":
                    if (e.ctrlKey) {
                        e.preventDefault();
                        saveImage();
                    }
                    break;
                default:
                    break;
            }
        }}>
        <div style={vertical ? { display: 'flex', flexDirection: 'column', height: "100vh", overflowY: 'hidden' } : { display: "flex", height: "100vh", overflowY: 'hidden' }}>

            {/* Image side */}
            <div style={{ textAlign: 'center', flex: "1", maxHeight: vertical ? '50vh' : undefined, position: 'relative' }}>
                <img src={imageUrl(image?.id ?? 0, image?.hiResAvailable)} style={{ maxWidth: "100%", height: "100%", objectFit: 'contain' }} />
                
                    {onLeft && <div style={{ position: 'absolute', left: '20px', top: 0, height: '100%', display: 'flex', flexDirection: 'column', alignContent: 'center', justifyContent: 'center' }}>
                        <IconButton onClick={onLeft}><ArrowBack /></IconButton>
                    </div>}
                    {onRight && <div style={{ position: 'absolute', right: '20px', top: 0, height: '100%', display: 'flex', flexDirection: 'column', alignContent: 'center', justifyContent: 'center' }}>
                        <IconButton onClick={onRight}><ArrowForward /></IconButton>
                    </div>}
                
                <div style={{ position: "absolute", left: '0', bottom: '0', display: 'flex', width: '100%', justifyContent: 'center' }}>
                    <ImageHotbar 
                        image={image} onUsePrompt={onUsePrompt}
                        onLeft={onLeft} onRight={onRight} 
                        onDelete={onDeleteForce} onFavorite={()=>{onFavorite?.()}}
                    />
                </div>
            </div>

            {/* info Panel */}
            <Card style={vertical ? { width: '100%' } : { maxWidth: "500px", width: "50vw" }}>
                <div style={{ height: vertical ? "50vh" : "100vh", overflowY: 'hidden', padding: "20px", display: "flex", flexDirection: 'column' }}>

                    {/* Buttons */}
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", gap: "10px", marginBottom:'10px' }}>
                        <div style={{ display: "flex", gap: "10px" }} >
                            <IconButton onClick={() => { setOpen(false) }}><ArrowBack /></IconButton>
                            {onFavorite && <Tooltip title={`${image?.favorite ? "Unfavorite" : "Favoirte"} this image`}><IconButton onClick={()=>{onFavorite()}}>{image?.favorite ? <Star /> : <StarBorder />}</IconButton></Tooltip>}
                        </div>

                        <div style={{ display: "flex", gap: "10px" }} >
                            <PromptReorderButton prompt={imageToPrompt(image, promptMode === 1)} iconOverride={promptMode === 1 ? <CoffeeOutlined /> : undefined} />
                            <Tooltip title={promptMode === 1 ? 'Use this base prompt' : 'Use this prompt'}>
                                <IconButton onClick={()=>onUsePrompt()}>
                                    {promptMode === 1 ? <TerminalOutlined /> : <Terminal />}
                                </IconButton>
                            </Tooltip>
                            {onDelete && <Tooltip title='Delete this image'><IconButton onClick={onDelete}><Delete /></IconButton></Tooltip>}
                        </div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: "1", overflowY: 'auto' }}>

                        {/* Prompt */}
                        <Card elevation={5}>
                            <Tabs value={promptMode} onChange={(_, val) => setPromptMode(val)}>
                                <Tab sx={{ textTransform: 'none' }} label="Prompt" />
                                {(image?.basePrompt?.trim().length ?? 0) !== 0 && <Tab sx={{ textTransform: 'none' }} label="Base Prompt" />}
                            </Tabs>
                            <div style={{ fontSize: ".7em", fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordWrap: 'break-word', padding: "10px" }}>{
                                promptMode === 0 ? image?.prompt : image?.basePrompt
                            }</div>

                        </Card>

                        {/* Negative Prompt */}
                        {(image?.negativePrompt?.trim().length ?? 0) !== 0 && <>
                            <div style={{ marginTop: "20px" }}><b>Negative Prompt</b></div>
                            <div style={{ fontSize: ".7em", fontFamily: 'monospace',  whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{image?.negativePrompt}</div>
                        </>}

                        {/* Model */}
                        <div style={{ marginTop: "20px" }}><b>Model</b></div>
                        <ModelCard modelTitle={image?.model ?? ""} currentImage={image} />

                        {/* LORAs */}
                        {(image?.loras?.length ?? 0) !== 0 && <>
                            <div style={{ marginTop: "20px" }}><b>Loras</b></div>
                            {image?.loras.map(a => <LoraCard loraAlias={a} currentImage={image} />)}
                        </>}

                        {/* HiRes Options */}
                        {!!onUpscale && <>
                            <div style={{ marginTop: "20px" }}><b>Upscaling</b></div>
                            <HiResPanel image={image} updateImage={onUpscale} />
                        </>}

                        {/* Metadata */}
                        <div style={{ width: "100%", display: "flex", flexWrap: "wrap", gap: "10px", fontSize: ".8em", marginTop: '10px' }}>
                            <div style={{ minWidth: "75px", flex: "1" }}>
                                <div style={{ marginTop: "20px" }}><b>Seed</b></div>
                                <div style={{ fontSize: ".9em", fontFamily: 'monospace' }}>{image?.seed}</div>
                            </div>
                            <div style={{ minWidth: "75px", flex: "1" }}>
                                <div style={{ marginTop: "20px" }}><b>Steps</b></div>
                                <div style={{ fontSize: ".9em", fontFamily: 'monospace' }}>{image?.steps}</div>
                            </div>
                            <div style={{ minWidth: "75px", flex: "1" }}>
                                <div style={{ marginTop: "20px" }}><b>CFG Scale</b></div>
                                <div style={{ fontSize: ".9em", fontFamily: 'monospace' }}>{image?.cfgScale.toFixed(2)}</div>
                            </div>
                            <div style={{ minWidth: "75px", flex: "1" }}>
                                <div style={{ marginTop: "20px" }}><b>Sampler</b></div>
                                <div style={{ fontSize: ".9em", fontFamily: 'monospace' }}>{image?.sampler}</div>
                            </div>

                            <div style={{ minWidth: "75px", flex: "1" }}>
                                <div style={{ marginTop: "20px" }}><b>Schedule</b></div>
                                <div style={{ fontSize: ".9em", fontFamily: 'monospace' }}>{image?.scheduleType}</div>
                            </div>

                        </div>

                        {/* Creation Date */}
                        <div style={{ minWidth: "75px", flex: "1", fontSize: '.8em' }}>
                            <div style={{ marginTop: "20px" }}><b>Created</b></div>
                            <div style={{ fontSize: ".9em", fontFamily: 'monospace' }}>{new Date(image?.created ?? 0).toLocaleString()}</div>
                        </div>
                    </div>

                </div>
            </Card>
        </div>
    </Dialog>

}