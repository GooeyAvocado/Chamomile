import { useMemo, useState } from "react"
import { GeneratedImage } from "../../model/GeneratedImage"
import { useQueue } from "../hooks/useQueue"
import ImageModal from "../shared/images/ImageModal"
import { useSnackbar } from "notistack"
import useApi from "../hooks/useApi"
import { deleteImage, favImage, interruptGeneration } from "../../api/Images"
import AreYouSureModal from "../shared/modals/AreYouSureModal"
import BrewingImageTile from "../shared/images/BrewingImageTile"
import { Accordion, AccordionDetails, AccordionSummary, Card, CircularProgress, Drawer, IconButton, Tooltip } from "@mui/material"
import { AutoFixHigh, Cancel, ExpandMore, ModelTraining, PlaylistPlay, ReceiptLong } from "@mui/icons-material"
import StatusButton from "../shared/StatusButton/StatusButton"
import VariableEditor from "../shared/variables/VariableEditor"
import PromptModelSelectorModal from "../shared/prompt/PromptModelSelectorModal"
import PromptBuilder from "../shared/prompt/PromptBuilder"
import QueuedImageTile from "../shared/images/QueuedImageTile"
import QueuedGroupImageTile from "../shared/images/QueuedGroupImageTile"
import ContextMenu from "../shared/ContextMenu"
import PromptOrderedModal from "../shared/prompt/PromptOrderedModal"

export default function DisplayPage() {

    //const MAX_BUFFER_SIZE = 16

    const [selectedImage, setSelectedImage] = useState(undefined as GeneratedImage | undefined)
    const [images, setImages] = useState([] as GeneratedImage[])
    const [deleteAys, setDeleteAys] = useState(false)

    const [promptboxOpen, setPromptboxOpen] = useState(false);
    const [queueOpen, setQueueOpen] = useState(false);
    const [modelsOpen, setModelsOpen] = useState(false);
    const [dynamicsOpen, setDynamicsOpen] = useState(false);

    const selectedIndex = useMemo(() => images.findIndex((val) => val.id === selectedImage?.id), [selectedImage, images])


    const delApi = useApi(deleteImage);
    const favApi = useApi(favImage)

    const { enqueueSnackbar } = useSnackbar();

    const { progress, activeJob, queue, groupedQueue, cancel } = useQueue((val) => {

        setImages((images) => {
            setSelectedImage((selectedImage) => {
                if (images.length === 0 || !selectedImage || images[0].id === selectedImage.id) {
                    return val;
                }
                return selectedImage;
            })
            return [val, ...images]
            //.slice(0, MAX_BUFFER_SIZE)
        })
    })

    const [interruptOpen, setInterruptOpen] = useState(false)
    const interruptApi = useApi(interruptGeneration)

    const onInterrupt = () => {
        if (!activeJob) return;
        setInterruptOpen(false);
        interruptApi.fetch(undefined, undefined, activeJob.id)
    }


    const onLeft = selectedIndex === 0 ? undefined : () => {
        setSelectedImage(images[selectedIndex - 1]);
    }

    const onRight = selectedIndex === images.length - 1 ? undefined : () => {
        setSelectedImage(images[selectedIndex + 1]);
    }

    const onHome = selectedIndex === 0 ? undefined : () => {
        setSelectedImage(images[0]);
    }

    const onEnd = selectedIndex === images.length - 1 ? undefined : () => {
        setSelectedImage(images[images.length - 1]);
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
            <div style={{ fontSize: '.7em', marginBottom: '20px' }}>Start generating images and they'll appear here</div>
            <BrewingImageHudActions
                collapsed
                toggleQueue={() => setQueueOpen(true)}
                setDynamicsOpen={setDynamicsOpen}
                setModelsOpen={setModelsOpen}
                togglePromptbox={() => setPromptboxOpen(true)}
            />
        </div>
        <ImageModal
            open={images.length > 0} setOpen={() => { }}
            image={selectedImage} disablePortal
            onDelete={() => setDeleteAys(true)} onDeleteForce={onDelete}
            onLeft={onLeft} onRight={onRight} onHome={onHome} onEnd={onEnd}
            onFavorite={onFavorite} onUpscale={onUpscale} collapseDefault
            onUsePrompt={() => { setPromptboxOpen(true) }}
            imageChildren={(collapsed) => <BrewingImageHUD collapsed={collapsed}
                togglePromptbox={() => setPromptboxOpen(true)} toggleQueue={() => setQueueOpen(true)}
                index={selectedIndex} bufferSize={images.length} setDynamicsOpen={setDynamicsOpen} setModelsOpen={setModelsOpen}
                onInterrupt={onInterrupt} setInterruptOpen={setInterruptOpen}
            />}
        >
        </ImageModal>
        <AreYouSureModal open={deleteAys} setOpen={setDeleteAys} title="Delete this image?" onYes={onDelete} loading={delApi.loading}>
            Are you sure you want to delete this image?
        </AreYouSureModal>

        <VariableEditor open={dynamicsOpen} setOpen={setDynamicsOpen} hidePromptPreview />
        <PromptModelSelectorModal open={modelsOpen} setOpen={setModelsOpen} hideLoras />
        <PromptOrderedModal
            jobId={activeJob?.id ?? 0}
            onCancel={onInterrupt}
            open={interruptOpen} prompt={activeJob}
            setOpen={setInterruptOpen}
            progress={progress}
        />


        <Drawer
            anchor="top" open={promptboxOpen} style={{ zIndex: "1300" }}
            onClose={() => setPromptboxOpen(false)}
            ModalProps={{ keepMounted: true }}
            slotProps={{
                paper: {
                    sx: {
                        maxWidth: "900px", width: "100%",
                        margin: 'auto', padding: "20px",
                        borderBottomLeftRadius: 8,
                        borderBottomRightRadius: 8,
                    },
                }
            }}
        >
            <PromptBuilder reducedBrewMenu />
        </Drawer>


        <Drawer
            anchor="top" open={queueOpen} style={{ zIndex: "1300" }}
            onClose={() => setQueueOpen(false)}
            ModalProps={{ keepMounted: true }}
            slotProps={{
                paper: {
                    sx: {
                        maxWidth: "900px", width: "100%",
                        margin: 'auto', padding: "20px",
                        borderBottomLeftRadius: 8,
                        borderBottomRightRadius: 8,
                    },
                }
            }}
        >
            <b>{queue.length} Image{queue.length > 1 ? "s" : ""} in queue</b>
            <hr style={{ width: '100%' }} />
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fill, minmax(80px, 1fr))`,
                gap: '20px', overflowX: 'clip', height: "25vh", minHeight: "200px",
                overflowY: "auto", textAlign: 'left'
            }}>
                {groupedQueue.map(p =>
                    p.length === 0 ? <></> :
                        p.length === 1 ? <QueuedImageTile prompt={p[0]} onCancel={() => cancel(p[0].id ?? 0)} tiny /> :
                            <QueuedGroupImageTile prompts={p} onCancel={cancel} tiny />
                )}
            </div>

        </Drawer>


    </>
}

function BrewingImageHUD(props: {
    collapsed?: boolean
    togglePromptbox: () => void
    toggleQueue: () => void
    index: number, bufferSize: number
    setModelsOpen: (val: boolean) => void
    setDynamicsOpen: (val: boolean) => void
    onInterrupt: () => void
    setInterruptOpen: (val: boolean) => void
}) {

    const {
        index, bufferSize, collapsed,
        togglePromptbox, toggleQueue,
        setModelsOpen, setDynamicsOpen,
        onInterrupt, setInterruptOpen
    } = props

    const { progress, queue, activeJob } = useQueue()

    return <>

        <div style={{
            position: "absolute", bottom: "10px", right: "10px", zIndex: 2, textAlign: 'right',
            opacity: '.5'
        }}>
            {/* <div style={{ mixBlendMode: 'color', marginBottom: '5px' }}>
                                <ImageStrip images={imageApi.images.slice(selectedIndex, selectedIndex + 3).map(a => a.id)} maxLength={3} imageSize="16px" />
                            </div> */}
            <div style={{ fontSize: ".6em", color: 'white', mixBlendMode: 'color-dodge' }}>
                {(index + 1).toLocaleString()} of {bufferSize?.toLocaleString()}
            </div>
        </div>

        <div style={{ position: 'absolute', left: "20px", top: '20px', zIndex: '2' }}>
            <BrewingImageHudActions
                collapsed={collapsed}
                toggleQueue={toggleQueue}
                setDynamicsOpen={setDynamicsOpen}
                setModelsOpen={setModelsOpen}
                togglePromptbox={togglePromptbox}
            />

            <Accordion expanded={activeJob !== undefined} style={{ opacity: collapsed && activeJob ? 1 : 0, transition: 'opacity 0.2s ease-in-out' }}>
                <AccordionSummary expandIcon={activeJob ? <ExpandMore /> : <></>}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {activeJob && <CircularProgress size={16} variant={progress ? "determinate" : "indeterminate"} value={(progress?.progress ?? 0) * 100} />}
                        <div>{queue.length > 0 ? `Brewing ${queue.length + 1} images` : activeJob ? 'Brewing an image' : ''}</div>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    <div style={{ width: '192px', marginTop: "-10px" }}>
                        <ContextMenu options={[{ icon: <Cancel />, text: "Cancel", onClick: onInterrupt }]}>
                            <BrewingImageTile
                                imageSrc={(progress?.current_image?.length ?? 0) === 0 ? "" : "data:image/png;base64," + progress?.current_image}
                                eta={progress?.eta_relative} onClick={() => { setInterruptOpen(true) }} progress={(progress?.progress ?? 0) * 100}
                            />
                        </ContextMenu>
                    </div>
                </AccordionDetails>
            </Accordion>
        </div>
    </>
}

function BrewingImageHudActions({
    collapsed,
    setDynamicsOpen,
    setModelsOpen,
    togglePromptbox,
    toggleQueue,
}: {
    collapsed: boolean | undefined,
    toggleQueue: () => void, togglePromptbox: () => void,
    setModelsOpen: (val: boolean) => void,
    setDynamicsOpen: (val: boolean) => void
}) {
    return <Card style={{ opacity: collapsed ? 1 : 0, transition: 'opacity 0.2s ease-in-out' }}>
        <div style={{ width: "100%", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: "2px 7px", gap: '2px' }}>
            <StatusButton />
            <Tooltip title="Open Queue">
                <IconButton onClick={toggleQueue}>
                    <PlaylistPlay />
                </IconButton>
            </Tooltip>
            <Tooltip title={`Open PromptBox`}>
                <IconButton onClick={togglePromptbox}>
                    <ReceiptLong />
                </IconButton>
            </Tooltip>
            <Tooltip title="Models">
                <IconButton onClick={() => setModelsOpen(true)}><ModelTraining /></IconButton>
            </Tooltip>
            <Tooltip title="Dynamics">
                <IconButton onClick={() => setDynamicsOpen(true)}><AutoFixHigh /></IconButton>
            </Tooltip>
        </div>
    </Card>
}
