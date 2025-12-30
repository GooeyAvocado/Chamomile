import { useMemo, useState } from "react"
import { GeneratedImage } from "../../model/GeneratedImage"
import { useQueue } from "../hooks/useQueue"
import ImageModal from "../shared/images/ImageModal"
import { useSnackbar } from "notistack"
import useApi from "../hooks/useApi"
import { deleteImage, favImage } from "../../api/Images"
import AreYouSureModal from "../shared/modals/AreYouSureModal"
import BrewingImageTile from "../shared/images/BrewingImageTile"
import { Prompt } from "../../model/Prompt"
import { Progress } from "../../model/Automatic1111/Progress"
import { Accordion, AccordionDetails, AccordionSummary, Card, CircularProgress, IconButton, Tooltip } from "@mui/material"
import { AutoFixHigh, Close, ExpandMore, ModelTraining, ReceiptLong } from "@mui/icons-material"
import StatusButton from "../shared/StatusButton/StatusButton"
import VariableEditor from "../shared/variables/VariableEditor"
import PromptModelSelectorModal from "../shared/prompt/PromptModelSelectorModal"
import PromptBuilder from "../shared/prompt/PromptBuilder"

export default function DisplayPage() {

    //const MAX_BUFFER_SIZE = 16

    const [selectedImage, setSelectedImage] = useState(undefined as GeneratedImage | undefined)
    const [images, setImages] = useState([] as GeneratedImage[])
    const [deleteAys, setDeleteAys] = useState(false)

    const [promptboxOpen, setPromptboxOpen] = useState(false);
    const [showPromptbox, setShowPromptbox] = useState(false)

    const openPromptBox = () => {
        setShowPromptbox(true)
        requestAnimationFrame(() => { setPromptboxOpen(true) })
    }

    const closePromptBox = () => {
        setPromptboxOpen(false);
        setTimeout(() => { setShowPromptbox(false) }, 300)
    }

    const togglePromptBox = () => {
        if (!showPromptbox) {
            openPromptBox()
        } else {
            closePromptBox();
        }
    }

    const selectedIndex = useMemo(() => images.findIndex((val) => val.id === selectedImage?.id), [selectedImage])


    const delApi = useApi(deleteImage);
    const favApi = useApi(favImage)

    const { enqueueSnackbar } = useSnackbar();

    const { progress, queue, activeJob } = useQueue((val) => {
        setSelectedImage(val)
        setImages((prev) => {
            return [val, ...prev]
            //.slice(0, MAX_BUFFER_SIZE)
        })
    })

    const onLeft = selectedIndex === 0 ? undefined : () => {
        setSelectedImage(images[selectedIndex - 1]);
    }

    const onRight = selectedIndex === images.length - 1 ? undefined : () => {
        setSelectedImage(images[selectedIndex + 1]);
    }

    const onDelete = () => {
        setDeleteAys(false)
        delApi.fetch(() => {
            enqueueSnackbar("Image deleted!", { variant: 'success' })
            if (selectedImage) {
                if (images.length <= 1) { //If there's one or less images then we need to close
                    setSelectedImage(undefined)
                } else if (selectedIndex >= images.length - 1) {
                    onLeft?.()
                } else {
                    onRight?.();
                }
            }
            setImages((prev) => {
                const newImages = [...prev].filter(a => a.id !== selectedImage?.id)
                return newImages
            })
        }, () => {
            enqueueSnackbar("Image could not be deleted!", { variant: 'error' })
        }, (selectedImage)?.id)
    }

    const onFavorite = (override?: GeneratedImage) => {
        if (!override && !selectedImage) return;
        const img = override ?? selectedImage ?? {} as GeneratedImage //This is to cover a condition eslint thinks exists, but really doesn't
        img.favorite = !img?.favorite;
        favApi.fetch((val) => {
            setImages((prev) => {
                if (!val) return prev
                const newImages = [...prev].map(a => {
                    if (a.id === img.id) return val
                    return a
                })
                return newImages
            })
            setSelectedImage(val)
        }, () => {
            enqueueSnackbar("Image could not be favorited!", { variant: 'error' })
        }, img)
    }

    const onUpscale = (val: GeneratedImage) => {
        setImages((prev) => {
            if (!val) return prev
            const newImages = [...prev].map(a => {
                if (a.id === val.id) return val
                return a
            })
            return newImages
        })
        setSelectedImage((prev) => prev?.id === val.id ? val : prev);
    }

    return <>
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: '256px', margin: "0 auto" }}>
            <img src="ChamomileWordsPrerendered.png" style={{ width: '256px' }} />
            {activeJob && <div style={{ width: '192px' }}><BrewingImageTile imageSrc={(progress?.current_image?.length ?? 0) === 0 ? "" : "data:image/png;base64," + progress?.current_image} eta={progress?.eta_relative} progress={(progress?.progress ?? 0) * 100} /></div>}
            <div style={{ marginTop: '10px' }}><b>Display Mode</b></div>
            <hr style={{ width: "256px" }} />
            <div style={{ fontSize: '.8em' }}>Start rendering images on another window and they will appear here</div>
        </div>
        <ImageModal
            open={!!selectedImage} setOpen={() => { }}
            image={selectedImage}
            onDelete={() => setDeleteAys(true)} onDeleteForce={onDelete}
            onLeft={onLeft} onRight={onRight}
            onFavorite={onFavorite} onUpscale={onUpscale} collapseDefault
            onUsePrompt={() => {
                if (!showPromptbox) { openPromptBox() }
            }}
            imageChildren={(collapse) => {
                return <BrewingImageHUD
                    progress={progress} queue={queue} activeJob={activeJob} collapsed={collapse}
                    promptboxOpen={promptboxOpen} showPromptbox={showPromptbox} togglePromptbox={togglePromptBox}
                />
            }}
        />
        <AreYouSureModal open={deleteAys} setOpen={setDeleteAys} title="Delete this image?" onYes={onDelete} loading={delApi.loading}>
            Are you sure you want to delete this image?
        </AreYouSureModal>
    </>
}

function BrewingImageHUD(props: {
    queue: Prompt[]
    progress: Progress | undefined
    activeJob?: Prompt,
    collapsed?: boolean
    promptboxOpen?: boolean
    showPromptbox?: boolean
    togglePromptbox?: () => void
}) {

    const { progress, queue, activeJob, collapsed, promptboxOpen, showPromptbox, togglePromptbox } = props
    const [modelsOpen, setModelsOpen] = useState(false);
    const [dynamicsOpen, setDynamicsOpen] = useState(false);



    return <>

        <VariableEditor open={dynamicsOpen} setOpen={setDynamicsOpen} hidePromptPreview />
        <PromptModelSelectorModal open={modelsOpen} setOpen={setModelsOpen} hideLoras />

        {showPromptbox && <div style={{ position: "absolute", left: "20px", top: "20px", right: "20px", zIndex: 2 }}>
            <Card style={{
                maxWidth: "900px", margin: "auto", padding: '20px',
                opacity: promptboxOpen ? 0.95 : 0,
                transform: promptboxOpen ? "scale(1)" : "scale(0.5)",
                transition: "transform 0.2s ease, opacity 0.2s ease"
            }}>
                <PromptBuilder reducedBrewMenu />
            </Card>
        </div>}

        <div style={{ position: 'absolute', left: "20px", top: '20px', zIndex: '2' }}>
            <Card style={{ opacity: collapsed ? 1 : 0, transition: 'opacity 0.2s ease-in-out' }}>
                <div style={{ width: "100%", display: 'flex', alignItems: 'center', padding: "2px 7px", gap: '2px' }}>
                    <StatusButton />
                    <Tooltip title="Models">
                        <IconButton onClick={() => setModelsOpen(true)} ><ModelTraining /></IconButton>
                    </Tooltip>
                    <Tooltip title="Dynamics">
                        <IconButton onClick={() => setDynamicsOpen(true)}><AutoFixHigh /></IconButton>
                    </Tooltip>
                    <div style={{ flex: 1 }} />
                    <Tooltip title={`${showPromptbox ? "Close p" : "P"}romptbox`}>
                        <IconButton onClick={togglePromptbox}>{
                            showPromptbox ? <Close /> : <ReceiptLong />
                        }</IconButton>
                    </Tooltip>
                </div>
            </Card>

            <Accordion expanded={activeJob !== undefined} style={{ opacity: collapsed && activeJob ? 1 : 0, transition: 'opacity 0.2s ease-in-out' }}>
                <AccordionSummary expandIcon={activeJob ? <ExpandMore /> : <></>}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {activeJob && <CircularProgress size={16} variant={progress ? "determinate" : "indeterminate"} value={(progress?.progress ?? 0) * 100} />}
                        <div>{queue.length > 0 ? `Brewing ${queue.length + 1} images` : activeJob ? 'Brewing an image' : ''}</div>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    <div style={{ width: '192px', marginTop: "-10px" }}>
                        <BrewingImageTile imageSrc={(progress?.current_image?.length ?? 0) === 0 ? "" : "data:image/png;base64," + progress?.current_image} eta={progress?.eta_relative} progress={(progress?.progress ?? 0) * 100} />
                    </div>
                </AccordionDetails>
            </Accordion>
        </div>
    </>
}