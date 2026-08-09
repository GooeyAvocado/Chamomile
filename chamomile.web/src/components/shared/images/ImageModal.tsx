import { GeneratedImage } from "../../../model/GeneratedImage";
import { Button, ButtonGroup, Card, CircularProgress, Dialog, IconButton, Link, Skeleton, Stack, Tab, Tabs, TextField, Tooltip } from "@mui/material";
import { imageUrl } from "../../../api/Images";
import { Add, ArrowBack, CalendarMonth, ChevronLeft, ChevronRight, Coffee, ContentPaste, Delete, DirectionsRun, Edit, Gradient, Image, ImageSearch, InfoOutlined, Margin, ModelTraining, OpenWith, PhotoLibrary, ReceiptLong, ReceiptLongTwoTone, Remove, Schedule, Source, Star, StarBorder, Tune, Window, Yard } from "@mui/icons-material";
import LoraCard from "../lora/LoraCard";
import { usePrompt } from "../../hooks/usePrompt";
import { useSnackbar } from "notistack";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import HiResPanel from "../upscaler/HiResPanel";
import PromptReorderButton from "../prompt/PromptReorderButton";
import { clearFilter, downloadImage, getRelativeTime, imageToPrompt } from "../Utils";
import { JSX, useEffect, useMemo, useRef, useState } from "react";
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
import { useThrottle } from "../../hooks/useThrottle";
import { useUpscalers } from "../../hooks/useUpscalers";
import useModifierKeys from "../../hooks/useModifierKeys";
import AdditionalInfoRendererMini from "./AdditionalInformationRendererMini";
import { CSSProperties } from "@mui/material/styles";

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
    onPageUp?: () => void,
    onPageDown?: () => void,
    onUp?: () => void,
    onDown?: () => void,
    onUpscale?: (val: GeneratedImage) => void
    onAddAlbum?: (val: Album) => void
    onRemoveAlbum?: (val: Album) => void
    onViewAlbum?: (val: Album) => void
    collapseDefault?: boolean
    imageChildren?: (collapse: boolean) => JSX.Element
    infoChildren?: JSX.Element
    moreLoading?: boolean
    /**Callback function only used to signal to the parent component that the user has asked to use this image's prompt */
    onUsePrompt?: () => void
    disablePortal?: boolean
}) {

    const {
        image, open, setOpen, onDelete, onFavorite,
        onLeft, onRight, onDeleteForce, onUpscale,
        collapseDefault, onAddAlbum, onRemoveAlbum,
        onViewAlbum, onDownload, onUpdateNotes,
        onUp, onDown, filter, setFilter, onHome, onEnd,
        onPageDown, onPageUp, disablePortal,
        moreLoading, onUsePrompt: signalOnUsePrompt
    } = props;

    const { setPrompt, setShowFloatingPromptBox } = usePrompt();
    const { enqueueSnackbar } = useSnackbar();
    const { width, height } = useWindowDimensions()
    const vertical = width < (500) / 0.45 || height / width > 1.45
    const { pong } = usePingPong();
    const { onUpscale: upscaleImage } = useUpscalers()

    const [_verticalCollapse, setVerticalCollapse] = useState(true)
    const [collapse, setCollapse] = useState(collapseDefault)
    const [promptMode, setPromptMode] = useState(0)
    const [downloadAys, setDownloadAys] = useState(false)
    const [albumsOpen, setAlbumsOpen] = useState(false)
    const [notesOpen, setNotesOpen] = useState(false)
    const [editNote, setEditNote] = useState("")
    const [showSd, setShowSd] = useState(false)
    const [showNegative, setShowNegative] = useState(false)

    const verticalCollapse = vertical && _verticalCollapse

    const [hideSidebar, setHideSidebar] = useState(false)
    const { ctrlHeld } = useModifierKeys();

    const THROTTLE_DELAY = 100
    const throttledLeft = useThrottle(onLeft, THROTTLE_DELAY);
    const throttledRight = useThrottle(onRight, THROTTLE_DELAY);
    const throttledUp = useThrottle(onUp, THROTTLE_DELAY)
    const throttledDown = useThrottle(onDown, THROTTLE_DELAY)
    const throttledPgUp = useThrottle(onPageUp, THROTTLE_DELAY)
    const throttledPgDn = useThrottle(onPageDown, THROTTLE_DELAY)

    useEffect(() => {
        if ((image?.basePrompt?.trim()?.length ?? 0) === 0 || image?.basePrompt === image?.prompt) setPromptMode(0)
        setNotesOpen(false)
        setShowNegative(false)
    }, [image])

    const movementRef = useRef(0);
    const resetTimerRef = useRef<number | null>(null);
    const showTimerRef = useRef<number | null>(null);

    useEffect(() => {
        if (!image) return;

        movementRef.current += 1;

        // Reset movement counter after 150ms of inactivity
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
        resetTimerRef.current = window.setTimeout(() => {
            movementRef.current = 0;
        }, 150);

        // If this is only a single movement, don't hide sidebar
        if (movementRef.current < 3) {
            setHideSidebar(false);
            return;
        }

        // Rapid movement → hide sidebar
        setHideSidebar(true);

        // Show sidebar after 100ms if user stops
        if (showTimerRef.current) clearTimeout(showTimerRef.current);
        showTimerRef.current = window.setTimeout(() => {
            setHideSidebar(false);
        }, 100);

        return () => {
            if (showTimerRef.current) clearTimeout(showTimerRef.current);
        };
    }, [image]);

    const basePromptAvailable = useMemo(() => (image?.basePrompt?.trim().length ?? 0) !== 0 && image?.basePrompt !== image?.prompt, [image])

    const onUsePrompt = (promptOverride?: Prompt) => {
        setOpen(false)
        enqueueSnackbar("Prompt loaded!", { variant: 'success' })
        setPrompt(promptOverride ?? imageToPrompt(image, promptMode === 1 || (basePromptAvailable && ctrlHeld)))
        setShowFloatingPromptBox(true)
        signalOnUsePrompt?.()
    }

    // window.open(imageUrl(image?.id ?? 0) + ".png");

    const saveImage = async () => {
        setDownloadAys(false);
        try {
            downloadImage(image);
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

    const executeUpscale = () => {
        if (!onUpscale || !image) return;
        enqueueSnackbar("Upscaling...", { variant: "info" })
        upscaleImage(image, onUpscale)
    }

    return <Dialog disablePortal={disablePortal} open={open && !!image} onClose={() => setOpen(false)} fullScreen
        onKeyUp={(e) => {
            if (e.location === 3) {
                switch (e.key) {
                    case ".":
                    case "Delete":
                        if (e.shiftKey && onDeleteForce) { onDeleteForce?.() }
                        else { onDelete?.() }
                        break;
                    default:
                        break;
                }
            }
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

            if (e.location === 3) {
                switch (e.key) {
                    case "4":
                    case "ArrowLeft":
                        throttledLeft()
                        break;
                    case "6":
                    case "ArrowRight":
                        throttledRight();
                        break;
                    case "9":
                    case "PageUp":
                        throttledPgUp()
                        break;
                    case "3":
                    case "PageDown":
                        throttledPgDn();
                        break;
                    case "8":
                    case "ArrowUp":
                        throttledUp()
                        break;
                    case "2":
                    case "ArrowDown":
                        throttledDown();
                        break;
                    case "7":
                    case "Home":
                        onHome?.();
                        break;
                    case "1":
                    case "End":
                        onEnd?.();
                        break;
                    case "0":
                        if ((image?.downloadCount ?? 0) > 0) { setDownloadAys(true); }
                        else { saveImage(); }
                        break;
                    case "5":
                    case "*":
                        onFavorite?.();
                        break;
                    case "+":
                    case "U":
                        executeUpscale();
                        break;
                    default:
                        break;
                }
                return;
            }

            switch (e.key) {
                case "ArrowLeft":
                    throttledLeft()
                    break;
                case "ArrowRight":
                    throttledRight();
                    break;
                case "PageUp":
                    throttledPgUp()
                    break;
                case "PageDown":
                    throttledPgDn();
                    break;
                case "ArrowUp":
                    throttledUp()
                    break;
                case "ArrowDown":
                    throttledDown();
                    break;
                case "Home":
                    onHome?.();
                    break;
                case "End":
                    onEnd?.();
                    break;
                case "S":
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
                case "D":
                    if (e.shiftKey) {
                        e.preventDefault();
                        if ((image?.downloadCount ?? 0) > 0) { setDownloadAys(true); }
                        else { saveImage(); }
                    }
                    break;
                case "u":
                case "U":
                    if (e.ctrlKey) {
                        e.preventDefault();
                        executeUpscale();
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
                    ? (collapse || verticalCollapse) ? '100vh' : '50vh' : undefined,
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
                    src={imageUrl(image?.id ?? 0, !showSd && image?.hiResAvailable)}
                    style={{
                        maxWidth: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        zIndex: 1,
                        position: 'relative'
                    }}
                />


                <IconButton onClick={() => setCollapse(false)} style={{ position: 'absolute', right: '20px', top: '20px', zIndex: 3, opacity: collapse ? 1 : 0, transition: 'opacity 0.5s ease' }}>
                    <InfoOutlined />
                </IconButton>

                {onLeft && <div style={{ position: 'absolute', left: '20px', top: 0, height: '100%', display: 'flex', flexDirection: 'column', alignContent: 'center', justifyContent: 'center', zIndex: 2 }}>
                    <IconButton onClick={onLeft}><ChevronLeft /></IconButton>
                </div>}

                {onRight && <div style={{ position: 'absolute', right: '20px', top: 0, height: '100%', display: 'flex', flexDirection: 'column', alignContent: 'center', justifyContent: 'center', zIndex: 2 }}>
                    <IconButton onClick={onRight}><ChevronRight /></IconButton>
                </div>}

                {moreLoading && <div style={{ position: 'absolute', right: '26px', top: 0, height: '100%', display: 'flex', flexDirection: 'column', alignContent: 'center', justifyContent: 'center', zIndex: 2 }}>
                    <CircularProgress size={"28px"} />
                </div>}

                <div style={{ position: "absolute", left: '0', bottom: '0', display: 'flex', width: '100%', justifyContent: 'center', zIndex: 2 }}>
                    <ImageHotbar
                        image={image} onUsePrompt={onUsePrompt} onUpscale={executeUpscale} onBack={() => setOpen(false)}
                        onLeft={onLeft} onRight={onRight} onDownload={saveImage} onInfo={() => setVerticalCollapse(false)}
                        onDelete={onDeleteForce} onFavorite={onFavorite} basePromptAvailable={basePromptAvailable}
                        vertical={vertical} hide={!_verticalCollapse && vertical}
                    />
                </div>

                {/* Counter */}
                {!vertical || !_verticalCollapse ? <div style={{
                    position: "absolute", left: '10px', bottom: '10px', zIndex: 2,
                    display: 'flex', flexDirection: 'column', alignItems: 'start',
                    fontSize: ".6em", opacity: '1', color: 'white', mixBlendMode: 'color-dodge'
                }}>
                    <div>{image?.id}.png</div>
                    <div>{image?.width}px x {image?.height}px</div>
                </div> : <></>}

                {props.imageChildren?.(!!collapse) ?? <></>}
            </div>

            {/* info Panel */}
            <Card style={vertical
                ? { width: '100%', zIndex: 2, maxHeight: collapse || verticalCollapse ? 0 : "50vh", transition: "max-height 0.5s ease" }
                : { maxWidth: collapse ? 0 : "500px", width: "50vw", transition: "max-width 0.5s ease", zIndex: '2' }}>
                {hideSidebar ? <div style={{ height: vertical ? "50vh" : "100vh", overflowY: 'hidden', padding: "20px", display: "flex", flexDirection: 'column' }}>

                    {/* Buttons */}
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", gap: "10px", marginBottom: '10px' }}>
                        <div style={{ display: "flex", gap: "10px" }} >
                            <IconButton disabled><ArrowBack /></IconButton>
                            {onFavorite && <IconButton disabled>{image?.favorite ? <Star htmlColor="gold" /> : <StarBorder />}</IconButton>}
                        </div>

                        <div style={{ display: "flex", gap: "10px" }} >
                            <IconButton disabled><Coffee /></IconButton>
                            <IconButton disabled> <ReceiptLong /> </IconButton>
                            {onDelete && <IconButton disabled><Delete /></IconButton>}
                        </div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: "1", overflowY: 'auto' }}>

                        {/* Prompt */}
                        <Card elevation={5}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Tabs value={promptMode} onChange={(_, val) => setPromptMode(val)} style={{ flex: "1" }}>
                                    <Tab sx={{ textTransform: 'none' }} label="Prompt" />
                                    {basePromptAvailable && <Tab sx={{ textTransform: 'none' }} label="Base Prompt" />}
                                </Tabs>
                                <div style={{ display: 'flex', gap: '10px', marginRight: "10px" }}>
                                    {filter && setFilter && <IconButton disabled><ImageSearch /></IconButton>}
                                    <IconButton disabled><ContentPaste fontSize="small" /></IconButton>
                                </div>
                            </div>
                            <div style={{ padding: '10px 10px 10px 10px' }}>
                                <Skeleton animation="wave" />
                                <Skeleton animation="wave" />
                                <Skeleton animation="wave" />
                            </div>
                        </Card>

                        {/* Negative Prompt */}
                        <Card elevation={5} style={{ marginTop: "8px" }}>
                            <div style={{ display: 'flex', alignItems: "center", padding: "0px 10px", marginTop: "8px" }}>
                                <b style={{ flex: "1" }}>Negative Prompt</b>
                                <IconButton disabled><ContentPaste fontSize="small" /></IconButton>
                            </div>
                            <hr style={{ margin: "4px 0px" }} />
                            <div style={{
                                fontSize: ".6em", fontFamily: 'monospace', padding: "10px"
                            }}>
                                <Skeleton animation="wave" />
                                <Skeleton animation="wave" />
                                <div style={{ textAlign: 'right', padding: "8px" }}>
                                    <Link>Show more</Link>
                                </div>
                            </div>

                        </Card>


                        {/* Model */}

                        <Stack style={{ marginTop: "10px" }} sx={{ gap: "10px" }}>
                            <Card style={{ padding: '10px' }} elevation={3}>
                                <div style={{ height: "36px", display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <Skeleton variant="rectangular" width={32} height={32} style={{ borderRadius: '4px' }} />
                                    <Skeleton animation="wave" variant="text" width={"200px"} height={"50px"} />
                                </div>
                            </Card>
                            <ComplexAccordion elevation={2} title={<><ModelTraining /> <div>LoRAs</div></>} disabled />
                            <ComplexAccordion elevation={2} title={<><PhotoLibrary /> <div>Collections</div></>} disabled />
                            <ComplexAccordion elevation={2} title={<><Gradient color={
                                image?.hiResAvailable ? "info" : "inherit"
                            } /><div>Upscale</div></>} disabled />
                            <ComplexAccordion elevation={2} title={<><Source /><div>Source</div></>} disabled />
                            <ComplexAccordion elevation={2} title={<><Margin /> <div>Metadata</div></>} disabled />
                        </Stack>
                    </div>


                </div> :

                    <div style={{ height: vertical ? "50vh" : "100vh", overflowY: 'hidden', padding: "20px", display: "flex", flexDirection: 'column' }}>

                        {vertical && <Button onClick={() => { setVerticalCollapse(true) }} style={{ marginTop: "-10px", marginBottom: '10px' }} color="inherit" variant="outlined">< Remove fontSize="small" /></Button>}

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
                                    prompt={imageToPrompt(image, promptMode === 1 || (basePromptAvailable && ctrlHeld))} source={promptMode === 1 || (basePromptAvailable && ctrlHeld) ? "IMAGE_BASE" : "IMAGE"}
                                />
                                <Tooltip title={promptMode === 1 || (basePromptAvailable && ctrlHeld) ? 'Use this base prompt' : 'Use this prompt'}>
                                    <IconButton onClick={() => onUsePrompt()}>
                                        {promptMode === 1 || (basePromptAvailable && ctrlHeld) ? <ReceiptLongTwoTone /> : <ReceiptLong />}
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
                            {(image?.negativePrompt?.trim().length ?? 0) !== 0 && <Card elevation={5} style={{ marginTop: "8px" }}>
                                <div style={{ display: 'flex', alignItems: "center", padding: "0px 10px", marginTop: "8px" }}>
                                    <b style={{ flex: "1" }}>Negative Prompt</b>
                                    <CopyToClipboardButton text={image?.negativePrompt} />
                                </div>
                                <hr style={{ margin: "4px 0px" }} />
                                <div style={{
                                    fontSize: ".6em", fontFamily: 'monospace', padding: "10px"
                                }}>
                                    <div style={showNegative ? { whiteSpace: 'pre-wrap', wordWrap: 'break-word' } : {
                                        whiteSpace: 'pre-wrap', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical', wordBreak: 'break-word'
                                    }}>
                                        {image?.negativePrompt}
                                    </div>
                                    <div style={{ textAlign: 'right', padding: "8px" }}>
                                        <Link style={{ cursor: "pointer" }} onClick={() => { setShowNegative(!showNegative) }}>Show {showNegative ? "less" : "more"}</Link>
                                    </div>
                                </div>

                            </Card>}

                            {/* Model */}
                            {/* <div style={{ marginTop: "10px" }}><b>Checkpoint</b></div> */}


                            <Stack style={{ marginTop: "10px" }} sx={{ gap: "10px" }}>

                                <ModelCard
                                    filter={filter} setFilter={setFilter}
                                    checkpointTitle={image?.model ?? ""} currentImage={image} elevation={5}
                                />

                                {/* LORAs */}
                                {(image?.loras?.length ?? 0) !== 0 && <ComplexAccordion elevation={2} title={<><ModelTraining /> <div>LoRAs</div></>}>
                                    <ComplexAccordionActions position="left" showOnState="collapsed" style={{ display: 'flex', gap: "5px" }}>
                                        {image && <LoraStrip loras={image?.loras} maxLength={6} />}
                                    </ComplexAccordionActions>
                                    <ComplexAccordionBody>
                                        <Stack sx={{ gap: "5px" }}>
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
                                    {onAddAlbum && <ComplexAccordionActions position="right" showOnState="any">
                                        <IconButton onClick={() => setAlbumsOpen(true)}><Add /></IconButton>
                                    </ComplexAccordionActions>}
                                    <ComplexAccordionBody>
                                        <ImageModalAlbumsDisplay albums={image?.albums} onRemove={onRemoveAlbum} onView={onViewAlbum} elevation={5} />
                                    </ComplexAccordionBody>
                                </ComplexAccordion>

                                {/* HiRes Options */}
                                <ComplexAccordion elevation={2} title={

                                    <>
                                        <Gradient color={image?.hiResAvailable ? "info" : "inherit"} />
                                        <div>Upscale{image?.hiResAvailable && "d"}</div>
                                    </>}


                                    disabled={!onUpscale || !pong?.SD}>

                                    {image?.hiResAvailable &&
                                        <ComplexAccordionActions position="right" showOnState="any">

                                            <ButtonGroup fullWidth size="small" color="info">
                                                <Tooltip title="Original">
                                                    <Button variant={showSd ? "contained" : undefined} onClick={() => setShowSd(true)}>
                                                        <Image />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip title="Upscaled">
                                                    <Button variant={showSd ? undefined : "contained"} onClick={() => setShowSd(false)}>
                                                        <Gradient />
                                                    </Button>
                                                </Tooltip>
                                            </ButtonGroup>

                                        </ComplexAccordionActions>
                                    }

                                    <ComplexAccordionBody>

                                        {!!onUpscale && pong?.SD && <HiResPanel image={image} updateImage={onUpscale} />}
                                    </ComplexAccordionBody>
                                </ComplexAccordion>

                                <ComplexAccordion elevation={2} title={<><Source /><div>Source</div></>} disabled={Object.keys(image?.additionalInfo ?? {}).length === 0}>
                                    <ComplexAccordionActions position="right" showOnState="collapsed">
                                        <AdditionalInfoRendererMini additionalInformation={image?.additionalInfo} />
                                    </ComplexAccordionActions>
                                    <ComplexAccordionBody>
                                        <AdditionalInfoRenderer
                                            filter={filter} setFilter={setFilter} imageId={image?.id ?? 0}
                                            additionalInformation={image?.additionalInfo}
                                        />
                                    </ComplexAccordionBody>
                                </ComplexAccordion>

                                <ComplexAccordion elevation={2} title={<><Margin /> <div>Metadata</div></>}>
                                    <ComplexAccordionActions position="left" showOnState="collapsed" style={{ display: 'flex', gap: "5px" }}>
                                        {image?.notes ?

                                            <span style={{
                                                whiteSpace: "pre-line", overflow: "hidden",
                                                textOverflow: "ellipsis", maxWidth: "300px",
                                                fontFamily: 'monospace', fontSize: '.6em',
                                                WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                                                display: "-webkit-box"
                                            }}>
                                                {image?.notes}
                                            </span> :
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: "4px" }}>
                                                <MetadataPill icon={<OpenWith fontSize="inherit" />} label="Dimensions" value={`${image?.width}x${image?.height}`} />
                                                <MetadataPill icon={<Window fontSize="inherit" />} label="Sampler" value={image?.sampler} />
                                                <MetadataPill icon={<DirectionsRun fontSize="inherit" />} label="Steps" value={image?.steps} />
                                                <MetadataPill icon={<Tune fontSize="inherit" />} label="Steps" value={image?.cfgScale?.toFixed(2)} />
                                                <MetadataPill icon={<Yard fontSize="inherit" />} label="Seed" value={image?.seed} />
                                                <MetadataPill icon={<Schedule fontSize="inherit" />} label="Generation Duration" value={
                                                    image?.generationDurationMs ? `${((image.generationDurationMs) / 1000.0).toFixed(1)}s` : undefined}
                                                />
                                                <MetadataPill icon={<CalendarMonth fontSize="inherit" />} label="Creation date" value={
                                                    image?.created ?
                                                        getRelativeTime(new Date(image?.created))
                                                        : undefined}
                                                />


                                            </div>
                                        }
                                    </ComplexAccordionActions>
                                    <ComplexAccordionBody style={{ padding: "0px 10px" }}>

                                        <MetadataTables
                                            filter={filter}
                                            image={image}
                                            setFilter={setFilter}
                                        />


                                        {/* Notes */}
                                        <div style={{ marginTop: "8px" }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>Notes</div>
                                                {onUpdateNotes &&
                                                    <IconButton disabled={notesOpen} onClick={() => {
                                                        setNotesOpen(true)
                                                        setEditNote(image?.notes ?? "")
                                                    }}><Edit /></IconButton>
                                                }
                                            </div>
                                            <hr style={{ margin: "4px 0px" }} />
                                            <div style={{ fontSize: ".7em", fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordWrap: 'break-word', padding: "10px 0px" }}>
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
                                        </div>
                                    </ComplexAccordionBody>
                                </ComplexAccordion>


                            </Stack>



                        </div>

                        {props.infoChildren}

                    </div>}
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

function MetadataTables({ image, filter, setFilter }: {
    image?: GeneratedImage
    filter?: FilterOptions,
    setFilter?: (filter: FilterOptions) => void
}) {

    const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse" }
    const tableRowStyle: React.CSSProperties = { borderBottom: "1px solid white" }
    const tableRowLastStyle: React.CSSProperties = {}
    const rowHeaderCellStyle: React.CSSProperties = { width: "66px" }
    const valueCellStyle: React.CSSProperties = { fontFamily: "monospace", fontSize: ".9em" }


    return <div style={{ display: 'flex', gap: "8px", fontSize: ".7em" }}>
        <Card style={{ flex: '1', padding: "8px" }}>
            <table style={tableStyle}>
                <tr style={tableRowStyle}>
                    <td style={rowHeaderCellStyle}><b>Seed</b></td>
                    <td style={valueCellStyle}>{image?.seed}</td>
                </tr>
                <tr style={tableRowStyle}>
                    <td style={rowHeaderCellStyle}><b>Steps</b></td>
                    <td style={valueCellStyle}>{image?.steps}</td>
                </tr>
                <tr style={tableRowLastStyle}>
                    <td style={rowHeaderCellStyle}><b>CFG</b></td>
                    <td style={valueCellStyle}>{image?.cfgScale?.toFixed(2)}</td>
                </tr>
            </table>
        </Card>
        <Card style={{ flex: '1', padding: "8px" }}>
            <table style={tableStyle}>
                <tr style={tableRowStyle}>
                    <td style={rowHeaderCellStyle}><b>Sampler</b></td>
                    <td style={valueCellStyle}>{image?.sampler}</td>
                </tr>
                <tr style={tableRowStyle}>
                    <td style={rowHeaderCellStyle}><b>Gen Time</b></td>
                    <td style={valueCellStyle}>{((image?.generationDurationMs ?? 0) / 1000.0).toFixed(2)}s</td>
                </tr>
                <tr style={tableRowLastStyle}>
                    <td style={rowHeaderCellStyle}><b>Created</b></td>
                    <td style={valueCellStyle}>{setFilter ?
                        <Link onClick={() => {
                            setFilter?.({
                                ...clearFilter(filter ?? {}),
                                fromDate: image?.created?.split("T")?.[0],
                                toDate: image?.created?.split("T")?.[0]
                            })
                        }}>
                            {new Date(image?.created ?? 0).toLocaleString(undefined, { month: "2-digit", day: "2-digit", year: "numeric", hour: "numeric", minute: "numeric" })}
                        </Link> :
                        new Date(image?.created ?? 0).toLocaleString()
                    }</td>
                </tr>
            </table>
        </Card>
    </div>

}

function MetadataPill({ icon, label, value }: {
    icon: React.ReactElement
    label: string,
    value?: string | number
}) {

    const cardStyle: CSSProperties = {
        padding: "2px 6px", display: 'flex',
        gap: "4px", alignItems: 'center',
        fontSize: ".5em", color: "lightgray",
        border: "1px solid lightgray",
        borderRadius: "4px", justifyContent: 'left'
    }

    if (!value) return <></>

    return <Tooltip title={label}>
        <div style={cardStyle}>
            {icon}
            <div>{value}</div>
        </div>
    </Tooltip>
}