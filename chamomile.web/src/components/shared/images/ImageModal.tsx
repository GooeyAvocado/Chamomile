import { GeneratedImage } from "../../../model/GeneratedImage";
import { Button, Card, Dialog, IconButton, Stack, Tab, Tabs, TextField, Tooltip } from "@mui/material";
import { imageUrl } from "../../../api/Images";
import { Add, ArrowBack, ArrowForward, CoffeeOutlined, Delete, Edit, Gradient, ImageSearch, Menu, ModelTraining, Notes, PhotoLibrary, ReceiptLong, ReceiptLongTwoTone, Source, Star, StarBorder } from "@mui/icons-material";
import LoraCard from "../lora/LoraCard";
import { usePrompt } from "../../hooks/usePrompt";
import { useSnackbar } from "notistack";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import HiResPanel from "../upscaler/HiResPanel";
import PromptReorderButton from "../prompt/PromptReorderButton";
import { clearFilter, imageToPrompt } from "../Utils";
import { useEffect, useState } from "react";
import ImageHotbar from "./ImageHotbar";
import { Prompt } from "../../../model/Prompt";
import CopyToClipboardButton from "../copybutton/CopyToClipboardButton";
import ImageModalAlbumsDisplay from "../albums/ImageModalAlbumsDisplay";
import { Album } from "../../../model/Album";
import AreYouSureModal from "../modals/AreYouSureModal";
import ComplexAccordion from "../complexAccordion/ComplexAccordion";
import ComplexAccordionActions from "../complexAccordion/ComplexAccordionActions";
import ComplexAccordionBody from "../complexAccordion/ComplexAccordionBody";
import AlbumBrowser from "../albums/AlbumBrowser";
import AlbumStrip from "../albums/AlbumStrip";
import LoraStrip from "../lora/LoraStrip";
import { usePingPong } from "../../hooks/usePingPong";
import HighlightedPromptDiv from "../prompt/HighlightedPromptDiv";
import AdditionalInfoRenderer from "./AdditionalInformationRenderer";
import { FilterOptions } from "../../../model/FilterOptions";
import ModelCard from "../checkpoint/CheckpointCard";

export default function ImageModal(props: {
    image?: GeneratedImage,
    filter?: FilterOptions
    setFilter?: (val: FilterOptions) => void
    open: boolean,
    setOpen: (val: boolean) => void
    onFavorite?: () => void,
    onUpdateNotes?: (val: string) => void,
    onDownload?: () => void,
    onDelete?: () => void,
    onDeleteForce?: () => void,
    onLeft?: () => void,
    onRight?: () => void,
    onHome?: () => void,
    onEnd?: () => void,
    onUp?: () => void,
    onDown?: () => void,
    onUpscale?: (val: GeneratedImage) => void
    onAddAlbum?: (val: Album) => void
    onRemoveAlbum?: (val: Album) => void
    onViewAlbum?: (val: Album) => void
    collapseDefault?: boolean
    imageChildren?: (collapse: boolean) => JSX.Element
    infoChildren?: JSX.Element
}) {

    const {
        image, open, setOpen, onDelete, onFavorite,
        onLeft, onRight, onDeleteForce, onUpscale,
        collapseDefault, onAddAlbum, onRemoveAlbum,
        onViewAlbum, onDownload, onUpdateNotes,
        onUp, onDown, filter, setFilter, onHome, onEnd
    } = props;

    const { setPrompt } = usePrompt();
    const { enqueueSnackbar } = useSnackbar();
    const { width, height } = useWindowDimensions()
    const vertical = width < (500) / 0.45 || height / width > 1.45
    const { pong } = usePingPong();

    const [collapse, setCollapse] = useState(collapseDefault)
    const [promptMode, setPromptMode] = useState(0)
    const [downloadAys, setDownloadAys] = useState(false)
    const [albumsOpen, setAlbumsOpen] = useState(false)
    const [notesOpen, setNotesOpen] = useState(false)
    const [editNote, setEditNote] = useState("")

    useEffect(() => {
        if ((image?.basePrompt?.trim()?.length ?? 0) === 0 || image?.basePrompt === image?.prompt) setPromptMode(0)
        setNotesOpen(false)
    }, [image])

    const onUsePrompt = (promptOverride?: Prompt) => {
        setOpen(false)
        enqueueSnackbar("Prompt loaded!", { variant: 'success' })
        setPrompt(promptOverride ?? imageToPrompt(image, promptMode === 1))
    }

    // window.open(imageUrl(image?.id ?? 0) + ".png");

    const saveImage = async () => {
        setDownloadAys(false);
        try {
            const a = document.createElement('a');
            a.href = imageUrl(image?.id ?? 0) + ".png?CountDownload=true";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            onDownload?.();
        } catch (error) {
            console.error('Error downloading the image:', error);
        }
    }

    const onMoreLikeThisPrompt = () => {
        if (!setFilter || !filter) return;
        setFilter({ ...clearFilter(filter), sample: image?.id, sampleMode: promptMode === 1 ? "BASE_HASH" : "HASH" })
        setOpen(false)
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
                case "ArrowUp":
                    onUp?.()
                    break;
                case "ArrowDown":
                    onDown?.();
                    break;
                case "Home":
                    onHome?.();
                    break;
                case "End":
                    onEnd?.();
                    break;
                case "s":
                    if (e.ctrlKey) {
                        e.preventDefault();
                        if ((image?.downloadCount ?? 0) > 0) { setDownloadAys(true); }
                        else { saveImage(); }
                    }
                    break;
                case "d":
                    if (e.ctrlKey) {
                        e.preventDefault();
                        onFavorite?.();
                    }
                    break;
                default:
                    break;
            }
        }}>
        <div key={image?.id} style={vertical
            ? { display: 'flex', flexDirection: 'column', height: "100vh", overflowY: 'hidden' }
            : { display: "flex", height: "100vh", overflowY: 'hidden' }}>

            {/* Image side */}
            <div style={{
                textAlign: 'center', flex: "1", maxHeight: vertical
                    ? collapse ? '100vh' : '50vh' : undefined,
                position: 'relative',
                backgroundColor: collapse ? 'black' : '#333',
                transition: 'background-color 0.5s ease, max-height 0.5s ease',
            }}
            >

                <img
                    src={imageUrl(image?.id ?? 0)}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: `blur(20px) brightness(${collapse ? 0.5 : 0.7})`,
                        transform: collapse || vertical ? 'scale(1.00)' : 'scale(1.01)', // avoids visible edges when blurring
                        zIndex: 0,
                        transition: 'filter 0.5s ease, transform 0.5s ease'
                    }}
                />

                <img
                    src={imageUrl(image?.id ?? 0, image?.hiResAvailable)}
                    style={{
                        maxWidth: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        zIndex: 1,
                        position: 'relative'
                    }}
                />


                <IconButton onClick={() => setCollapse(false)} style={{ position: 'absolute', right: '20px', top: '20px', zIndex: 3, opacity: collapse ? 1 : 0, transition: 'opacity 0.5s ease' }}>
                    <Menu />
                </IconButton>

                {onLeft && <div style={{ position: 'absolute', left: '20px', top: 0, height: '100%', display: 'flex', flexDirection: 'column', alignContent: 'center', justifyContent: 'center', zIndex: 2 }}>
                    <IconButton onClick={onLeft}><ArrowBack /></IconButton>
                </div>}
                {onRight && <div style={{ position: 'absolute', right: '20px', top: 0, height: '100%', display: 'flex', flexDirection: 'column', alignContent: 'center', justifyContent: 'center', zIndex: 2 }}>
                    <IconButton onClick={onRight}><ArrowForward /></IconButton>
                </div>}

                <div style={{ position: "absolute", left: '0', bottom: '0', display: 'flex', width: '100%', justifyContent: 'center', zIndex: 2 }}>
                    <ImageHotbar
                        image={image} onUsePrompt={onUsePrompt}
                        onLeft={onLeft} onRight={onRight} onDownload={saveImage}
                        onDelete={onDeleteForce} onFavorite={onFavorite}
                    />
                </div>

                <div style={{
                    position: "absolute", left: '10px', bottom: '10px', zIndex: 2,
                    display: 'flex', flexDirection: 'column', alignItems: 'start',
                    fontSize: ".6em", opacity: '1', color: 'white', mixBlendMode: 'color-dodge'
                }}>
                    <div>{image?.id}.png</div>
                    <div>{image?.width}px x {image?.height}px</div>
                </div>

                {props.imageChildren?.(!!collapse) ?? <></>}
            </div>

            {/* info Panel */}
            <Card style={vertical
                ? { width: '100%', zIndex: 2, maxHeight: collapse ? 0 : "50vh", transition: "max-height 0.5s ease" }
                : { maxWidth: collapse ? 0 : "500px", width: "50vw", transition: "max-width 0.5s ease", zIndex: '2' }}>
                <div style={{ height: vertical ? "50vh" : "100vh", overflowY: 'hidden', padding: "20px", display: "flex", flexDirection: 'column' }}>

                    {/* Buttons */}
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", gap: "10px", marginBottom: '10px' }}>
                        <div style={{ display: "flex", gap: "10px" }} >
                            <IconButton onClick={() => {
                                if (collapseDefault) setCollapse(!collapse)
                                else setOpen(false)
                            }}><ArrowBack /></IconButton>
                            {onFavorite && <Tooltip title={`${image?.favorite ? "Unfavorite" : "Favoirte"} this image`}><IconButton onClick={() => { onFavorite() }}>{image?.favorite ? <Star htmlColor="gold" /> : <StarBorder />}</IconButton></Tooltip>}
                        </div>

                        <div style={{ display: "flex", gap: "10px" }} >
                            <PromptReorderButton
                                prompt={imageToPrompt(image, promptMode === 1)} source={promptMode === 1 ? "IMAGE_BASE" : "IMAGE"}
                                sample={(image?.additionalInfo?.sample ?? 0) > 0 ? image?.additionalInfo?.sample : image?.id}
                                iconOverride={promptMode === 1 ? <CoffeeOutlined /> : undefined}
                            />
                            <Tooltip title={promptMode === 1 ? 'Use this base prompt' : 'Use this prompt'}>
                                <IconButton onClick={() => onUsePrompt()}>
                                    {promptMode === 1 ? <ReceiptLongTwoTone /> : <ReceiptLong />}
                                </IconButton>
                            </Tooltip>
                            {onDelete && <Tooltip title='Delete this image'><IconButton onClick={onDelete}><Delete /></IconButton></Tooltip>}
                        </div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: "1", overflowY: 'auto' }}>

                        {/* Prompt */}
                        <Card elevation={5}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Tabs value={promptMode} onChange={(_, val) => setPromptMode(val)} style={{ flex: "1" }}>
                                    <Tab sx={{ textTransform: 'none' }} label="Prompt" />
                                    {(image?.basePrompt?.trim().length ?? 0) !== 0 && image?.basePrompt !== image?.prompt && <Tab sx={{ textTransform: 'none' }} label="Base Prompt" />}
                                </Tabs>
                                <div style={{ display: 'flex', gap: '10px', marginRight: "10px" }}>
                                    {filter && setFilter && <Tooltip title={`More like this${promptMode === 1 ? " base" : ""} prompt`}><IconButton onClick={onMoreLikeThisPrompt}><ImageSearch /></IconButton></Tooltip>}
                                    <CopyToClipboardButton text={promptMode === 0 ? image?.prompt : image?.basePrompt} />
                                </div>
                            </div>
                            <HighlightedPromptDiv
                                prompt={promptMode === 0 ? image?.prompt : image?.basePrompt}
                            />
                        </Card>

                        {/* Negative Prompt */}
                        {(image?.negativePrompt?.trim().length ?? 0) !== 0 && <>
                            <div style={{ marginTop: "20px", display: 'flex', alignItems: "center" }}>
                                <b style={{ flex: "1" }}>Negative Prompt</b>
                                <CopyToClipboardButton text={image?.negativePrompt} style={{ paddingRight: "16px" }} />
                            </div>
                            <div style={{ fontSize: ".6em", fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{image?.negativePrompt}</div>
                        </>}

                        {/* Model */}
                        <div style={{ marginTop: "20px" }}><b>Checkpoint</b></div>
                        <ModelCard
                            filter={filter} setFilter={setFilter}
                            checkpointTitle={image?.model ?? ""} currentImage={image} elevation={5}
                        />

                        <Stack style={{ marginTop: "20px" }} gap={"10px"}>
                            {/* LORAs */}
                            {(image?.loras?.length ?? 0) !== 0 && <ComplexAccordion elevation={2} title={<><ModelTraining /> <div>LoRAs</div></>}>
                                <ComplexAccordionActions position="left" showOnState="collapsed" style={{ display: 'flex', gap: "5px" }}>
                                    {image && <LoraStrip loras={image?.loras} maxLength={6} />}
                                </ComplexAccordionActions>
                                <ComplexAccordionBody>
                                    <Stack gap={"5px"}>
                                        {image?.loras?.map(a => <LoraCard
                                            filter={filter} setFilter={setFilter}
                                            key={a} loraAlias={a} currentImage={image} elevation={5}
                                        />)}
                                    </Stack>
                                </ComplexAccordionBody>
                            </ComplexAccordion>}

                            <ComplexAccordion elevation={2} title={<><PhotoLibrary /> <div>Collections</div></>}>
                                <ComplexAccordionActions position="left" showOnState="collapsed" style={{ display: 'flex', gap: "5px" }}>
                                    {image && <AlbumStrip albums={image?.albums} maxLength={6} />}
                                </ComplexAccordionActions>
                                {onAddAlbum && <ComplexAccordionActions position="right" showOnState="expanded">
                                    <IconButton onClick={() => setAlbumsOpen(true)}><Add /></IconButton>
                                </ComplexAccordionActions>}
                                <ComplexAccordionBody>
                                    <ImageModalAlbumsDisplay albums={image?.albums} onRemove={onRemoveAlbum} onView={onViewAlbum} elevation={5} />
                                </ComplexAccordionBody>
                            </ComplexAccordion>

                            <ComplexAccordion elevation={2} title={<><Notes /> <div>Notes</div></>}>
                                <ComplexAccordionActions position="left" showOnState="collapsed" style={{ display: 'flex', gap: "5px" }}>
                                    <span style={{
                                        whiteSpace: "pre-line", overflow: "hidden",
                                        textOverflow: "ellipsis", maxWidth: "300px",
                                        fontFamily: 'monospace', fontSize: '.6em',
                                        WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                                        display: "-webkit-box"
                                    }}>
                                        {image?.notes}
                                    </span>
                                </ComplexAccordionActions>
                                {onUpdateNotes && <ComplexAccordionActions position="right" showOnState="expanded">
                                    <IconButton disabled={notesOpen} onClick={() => {
                                        setNotesOpen(true)
                                        setEditNote(image?.notes ?? "")
                                    }}><Edit /></IconButton>
                                </ComplexAccordionActions>}
                                <ComplexAccordionBody>
                                    <div style={{ fontSize: ".7em", fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordWrap: 'break-word', padding: "10px" }}>
                                        {!notesOpen
                                            ? (image?.notes?.length ?? 0) === 0 ? "Image has no notes" : image?.notes
                                            : <>
                                                <TextField
                                                    value={editNote} onChange={(e) => setEditNote(e.target.value)}
                                                    fullWidth multiline placeholder="Set a note" minRows={5} maxRows={5}
                                                    slotProps={{ htmlInput: { style: { fontSize: '.8em', fontFamily: 'monospace' } } }}
                                                />
                                                <div style={{ display: 'flex', justifyContent: "end", gap: "10px", marginTop: "10px" }}>
                                                    <Button onClick={() => {
                                                        setNotesOpen(false)
                                                        if (editNote.trim() !== (image?.notes ?? "").trim()) {
                                                            onUpdateNotes?.(editNote)
                                                        }
                                                    }}>
                                                        OK
                                                    </Button>
                                                </div>
                                            </>
                                        }
                                    </div>
                                </ComplexAccordionBody>
                            </ComplexAccordion>

                            {/* HiRes Options */}
                            <ComplexAccordion elevation={2} title={<><Gradient color={
                                image?.hiResAvailable ? "info" : "inherit"
                            } /> <div>Upscale{image?.hiResAvailable && "d"}</div></>} disabled={!onUpscale || !pong?.SD}>

                                <ComplexAccordionBody>
                                    {!!onUpscale && pong?.SD && <HiResPanel image={image} updateImage={onUpscale} />}
                                </ComplexAccordionBody>
                            </ComplexAccordion>

                            <ComplexAccordion elevation={2} title={<><Source /><div>Source</div></>} disabled={Object.keys(image?.additionalInfo ?? {}).length === 0}>
                                <ComplexAccordionBody>
                                    <AdditionalInfoRenderer
                                        filter={filter} setFilter={setFilter} imageId={image?.id ?? 0}
                                        additionalInformation={image?.additionalInfo}
                                    />
                                </ComplexAccordionBody>
                            </ComplexAccordion>



                        </Stack>


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
                                <div style={{ marginTop: "20px" }}><b>Scheduler</b></div>
                                <div style={{ fontSize: ".9em", fontFamily: 'monospace' }}>{image?.scheduleType}</div>
                            </div>

                        </div>

                        <div style={{ width: "100%", display: "flex", flexWrap: "wrap", gap: "10px", fontSize: ".8em", marginTop: '10px' }}>
                            {/* Creation Date */}
                            <div style={{ minWidth: "75px", flex: "1" }}>
                                <div style={{ marginTop: "20px" }}><b>Created</b></div>
                                <div style={{ fontSize: ".9em", fontFamily: 'monospace' }}>{new Date(image?.created ?? 0).toLocaleString()}</div>
                            </div>

                            {/* Duration */}
                            {image?.generationDurationMs && <div style={{ minWidth: "75px", flex: "1" }}>
                                <div style={{ marginTop: "20px" }}><b>Generation Duration</b></div>
                                <div style={{ fontSize: ".9em", fontFamily: 'monospace' }}>{(image?.generationDurationMs / 1000.0)}s</div>
                            </div>}


                        </div>
                    </div>

                    {props.infoChildren}

                </div>
            </Card>
        </div >

        {onAddAlbum && <AlbumBrowser
            open={albumsOpen} setOpen={setAlbumsOpen} albums={image?.albums ?? []}
            onSelect={(val) => val ? onAddAlbum(val) : console.error("Browser somehow responded with nothing", val)}
        />
        }

        <AreYouSureModal open={downloadAys} setOpen={setDownloadAys} title="Download this image again?" onYes={saveImage}>
            This image has already been downloaded {image?.downloadCount ?? 0} times. Are you sure you want to download it again?
        </AreYouSureModal>

    </Dialog >

}