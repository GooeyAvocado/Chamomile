import { Alert, Button, Card, IconButton, LinearProgress } from "@mui/material";
import { Grid } from "../../../model/Grid";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import { ArrowBack, Coffee, Delete, Edit } from "@mui/icons-material";
import { FilterOptions } from "../../../model/FilterOptions";
import { useImages } from "../../hooks/useImages";
import { useQueue } from "../../hooks/useQueue";
import { GeneratedImage } from "../../../model/GeneratedImage";
import { useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import useApi from "../../hooks/useApi";
import { deleteImage, enqueuePrompts, favImage, noteImage } from "../../../api/Images";
import { updateImageAlbums } from "../../../api/Albums";
import { Album } from "../../../model/Album";
import ImageAlbumRequest from "../../../model/ImageAlbumRequest";
import { useNavigate } from "react-router-dom";
import { Prompt } from "../../../model/Prompt";
import { updateGrid } from "../../../api/Grid";
import GridEditor from "./GridEditor";
import ImageModal from "../images/ImageModal";
import AreYouSureModal from "../modals/AreYouSureModal";
import QueuedImageTile from "../images/QueuedImageTile";
import { GridTypes } from "./GridTypes";
import BrewingImageTile from "../images/BrewingImageTile";
import PromptOrderData from "../../../model/PromptOrderData";
import ImageTile from "../images/ImageTile";

export default function GridViewer({
    grid, onBack, onDelete, setGrid
}: {
    grid: Grid
    setGrid: (val?: Grid) => void
    onBack: () => void
    onDelete: () => void
}) {

    const { enqueueSnackbar } = useSnackbar();
    const { vertical } = useWindowDimensions();
    const [filter] = useState({
        grid: grid.id,
        disablePagination: true
    } as FilterOptions)

    const imageApi = useImages(filter)
    const delApi = useApi(deleteImage);
    const favApi = useApi(favImage)
    const notesApi = useApi(noteImage)
    const brewApi = useApi(enqueuePrompts)
    const { fetch: update, loading: updateLoading } = useApi(updateGrid)
    const updateImageAlbumsAPI = useApi(updateImageAlbums)
    const nav = useNavigate();

    const { activeJob, queue, progress, cancel: cancelJob } = useQueue((val) => {
        if ((val.additionalInfo as PromptOrderData).gridId === grid.id) imageApi.appendImage(val)
    })

    const [deleteAys, setDeleteAys] = useState(false)
    const [editorOpen, setEditorOpen] = useState(false)
    const [viewerOpen, setViewerOpen] = useState(false)
    const [editorState, setEditorState] = useState<Grid>()
    const [selectedImage, setSelectedImage] = useState(undefined as undefined | GeneratedImage)

    const onDeleteImage = (override?: GeneratedImage) => {
        setDeleteAys(false)
        delApi.fetch(() => {
            enqueueSnackbar("Image deleted!", { variant: 'success' })
            if (selectedImage) {
                //If the count is 1, then we've deleted the last image
                if (imageApi.count === 1) {
                    setSelectedImage(undefined)
                } else {
                    onRight();
                }
            }
            imageApi.removeImage(override ?? selectedImage ?? {} as GeneratedImage)
        }, () => {
            enqueueSnackbar("Image could not be deleted!", { variant: 'error' })
        }, (override ?? selectedImage)?.id)
    }

    const onFavorite = (override?: GeneratedImage) => {
        if (!override && !selectedImage) return;
        const img = override ?? selectedImage ?? {} as GeneratedImage //This is to cover a condition eslint thinks exists, but really doesn't
        img.favorite = !img?.favorite;
        favApi.fetch((val) => {
            imageApi.updateImage(val ?? override ?? selectedImage ?? {} as GeneratedImage)
        }, () => {
            enqueueSnackbar("Image could not be favorited!", { variant: 'error' })
        }, img)
    }

    const onNotesUpdate = (val: string) => {
        if (!selectedImage) return;
        const img = selectedImage
        img.notes = val;
        notesApi.fetch((val) => {
            imageApi.updateImage(val ?? selectedImage)
        }, () => {
            enqueueSnackbar("Notes could not be updated!", { variant: 'error' })
        }, img)
    }

    const onDownload = () => {
        if (!selectedImage) return;
        console.log("Updating image count")
        const img = { ...selectedImage, downloadCount: (selectedImage.downloadCount ?? 0) + 1 } as GeneratedImage;
        imageApi.updateImage(img)
        setSelectedImage(img)
    }

    const onUpscale = (val: GeneratedImage) => {
        imageApi.updateImage(val ?? selectedImage)
        setSelectedImage(val);
    }

    const onAddAlbum = (val: Album) => {
        updateImageAlbumsAPI.fetch(() => {
            const newImg = {
                ...selectedImage,
                albums: [...(selectedImage?.albums ?? []), val.id]
            } as GeneratedImage


            imageApi.updateImage(newImg)
            setSelectedImage(newImg);
            enqueueSnackbar("Added to collection!", { variant: "success" })
        }, () => {
            enqueueSnackbar("Could not add to collection", { variant: "error" })
        }, selectedImage?.id, {
            albumId: val.id,
            mode: "ADD"
        } as ImageAlbumRequest)


    }

    const onRemoveAlbum = (val: Album) => {

        updateImageAlbumsAPI.fetch(() => {

            const newImg = {
                ...selectedImage,
                albums: [...(selectedImage?.albums ?? [])].filter(a => a !== val.id)
            } as GeneratedImage


            imageApi.updateImage(newImg)
            setSelectedImage(newImg);


            enqueueSnackbar("Removed from collection!", { variant: "success" })
        }, () => {
            enqueueSnackbar("Could not remove from collection", { variant: "error" })
        }, selectedImage?.id, {
            albumId: val.id,
            mode: "REMOVE"
        } as ImageAlbumRequest)


    }

    const onViewAlbum = (val: Album) => {
        nav(`/album/${val.id}`)
    }

    function gridSizedArray<T>(): T[][] {
        return Array.from({ length: grid.yVals.length }, () => Array(grid.xVals.length).fill(undefined as T));
    }


    const imageMap = useMemo(() => {
        return imageApi.images.reduce((r, i) => {
            r[i.additionalInfo?.yPos ?? 0][i.additionalInfo?.xPos ?? 0] = i
            return r;
        }, gridSizedArray<GeneratedImage>())

    }, [imageApi.images])

    const filteredQueue = useMemo(() => {
        return queue.filter(a => a.orderData?.gridId === grid.id)
    }, [queue])

    const queueMap = useMemo(() => {
        return filteredQueue.reduce((r, i) => {
            r[i.orderData?.yPos ?? 0][i.orderData?.xPos ?? 0] = i
            return r;
        }, gridSizedArray<Prompt>())
    }, [filteredQueue])

    const activeJobIsGrid = activeJob?.orderData?.gridId === grid.id


    const onLeft = () => {
        const currentCol = selectedImage?.additionalInfo?.xPos ?? 0
        const currentRow = selectedImage?.additionalInfo?.yPos ?? 0

        if (currentRow === 0 && currentCol === 0) return;
        if (currentCol === 0) setSelectedImage(imageMap[currentRow - 1][grid.xVals.length - 1]);
        else setSelectedImage(imageMap[currentRow][currentCol - 1]);
    }

    const onRight = () => {

        const currentCol = selectedImage?.additionalInfo?.xPos ?? 0
        const currentRow = selectedImage?.additionalInfo?.yPos ?? 0

        console.log(currentRow, currentCol)

        if (currentRow === grid.yVals.length - 1 && currentCol === grid.xVals.length - 1) return;
        if (currentCol === grid.xVals.length - 1) setSelectedImage(imageMap[currentRow + 1][0]);
        else setSelectedImage(imageMap[currentRow][currentCol + 1]);
    }

    const queueMissingImages = () => {

        const allPrompts = [] as Prompt[]
        const xType = GridTypes.find(a => a.code === grid.xValMode)
        const yType = GridTypes.find(a => a.code === grid.xValMode)
        if (!xType || !yType) {
            enqueueSnackbar("Unknown axis modes set",)
            return;
        };

        gridSizedArray<string>().forEach((r, y) => {
            r.forEach((_, x) => {
                const alreadyBrewed = !!imageMap?.[y]?.[x]
                const alreadyQueued = !!queueMap?.[y]?.[x]

                if (!alreadyBrewed && !alreadyQueued) {
                    const prompt = {
                        ...grid,
                        positivePrompt: grid.prompt,
                        variables: {}
                    } as Prompt

                    const orderData = {
                        source: "GRID",
                        gridId: grid.id,
                        xPos: x,
                        yPos: y,
                        xVal: grid.xVals[x],
                        yVal: grid.yVals[y],
                    } as PromptOrderData

                    const finalPrompt = {
                        ...yType.applyToPrompt(xType.applyToPrompt(prompt, grid.xVals[x], grid.xVals), grid.yVals[y], grid.yVals),
                        orderData: orderData
                    } as Prompt

                    allPrompts.push(finalPrompt)
                }
            })
        })

        brewApi.fetch((val) => {
            enqueueSnackbar(`${val?.jobIds.length} orders placed!`, { variant: 'success' })
        }, () => {
            enqueueSnackbar("Could not queue images!", { variant: 'error' })
        }, allPrompts)
    }

    const onEdit = () => {
        setEditorState(grid)
        setEditorOpen(true)
    }

    const onEditorOk = () => {
        if (!editorState) return;
        if (editorState.xValMode === "NON" && editorState.yValMode === "NON") {
            enqueueSnackbar("Please specify at least one axis!", { variant: "error" })
            return;
        }

        if (editorState.xValMode === "NON") { editorState.xVals = [""] } else {
            if (editorState.xVals.length === 0) {
                enqueueSnackbar("Please specify at least one X axis value!", { variant: "error" })
                return;
            }
        }

        if (editorState.yValMode === "NON") { editorState.yVals = [""] } else {
            if (editorState.yVals.length === 0) {
                enqueueSnackbar("Please specify at least one Y axis value!", { variant: "error" })
                return;
            }
        }



        update((val) => {
            enqueueSnackbar("Grid updated!", { variant: "success" })
            setGrid(val)
            setEditorOpen(false)
        }, () => {
            enqueueSnackbar("Could not update grid", { variant: "error" })
        }, editorState)

    }

    const expectedImageCount = grid.xVals.length * grid.yVals.length;
    const missingImageCount = expectedImageCount - imageApi?.images?.length
    const inProgressImages = filteredQueue.length
    const allMissingInProgress = missingImageCount === 0 || missingImageCount === inProgressImages + (activeJob?.orderData?.gridId === grid.id ? 1 : 0)
    const allMissing = imageApi?.images?.length === 0 && !allMissingInProgress

    const imageSize = 256

    return <>
        <div style={{
            display: "flex", paddingTop: "16px", gap: "16px",
            flexDirection: vertical ? "row" : undefined
        }}>

            <div style={{ display: 'flex', flexDirection: 'column', flex: "1", height: "100%" }}>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: "8px" }}>

                    {/* Header */}
                    <div style={{
                        fontFamily: 'Merriweather', fontSize: "1.5em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        display: 'flex', gap: "10px", alignItems: "center", flex: "1"
                    }}>
                        {onBack && <IconButton size="small" onClick={onBack}><ArrowBack /></IconButton>}
                        {grid.name}
                    </div>

                    {/* End Section */}
                    <div style={{ display: 'flex', gap: "20px" }}>


                        <div style={{ fontSize: ".8em", textAlign: "right", flex: "1, 0" }}>
                            <div>
                                <span>{grid.xVals.length} x {grid.yVals.length} ({grid.xVals.length * grid.yVals.length} images)</span>
                                <span style={{ color: "#CC1155" }}> {missingImageCount > 0 && !allMissing && `(${missingImageCount} not generated)`}</span>
                            </div>
                            <div>{grid.created && new Date(grid.created).toLocaleString()}</div>
                        </div>
                        <div style={{ display: 'flex', gap: "8px" }}>
                            <IconButton onClick={() => onEdit()}><Edit fontSize="small" /></IconButton>
                            <IconButton onClick={() => onDelete()}><Delete fontSize="small" /></IconButton>
                        </div>
                    </div>

                </div>


            </div>

        </div>

        <hr style={{ width: "100%" }} />
        {!allMissingInProgress && <Card style={{ padding: "5px 10px" }}>
            <Alert severity={allMissing ? "info" : "warning"} style={{ padding: "5px 10px" }} action={
                <Button
                    onClick={queueMissingImages} startIcon={<Coffee />} variant="outlined" color={allMissing ? "info" : "warning"}
                    size="small" style={{ marginRight: '8px', marginTop: "-2px" }}
                >
                    Brew{allMissing ? "" : "remaining "} images
                </Button>
            }>
                {allMissing ? "Start brewing whenever you're ready" : "Some images haven not been brewed yet for this grid"}
            </Alert>
        </Card>}

        {filteredQueue.length > 0 && <Card style={{ padding: "5px 10px", display: 'flex', gap: "20px", alignItems: 'center', fontSize: ".8em" }}>

            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src="/brewing.gif" width={48} />
                <div>Generating grid images </div>
            </div>
            <div style={{ flex: "1", display: "flex", flexDirection: 'column', gap: "10px", fontSize: ".8em" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: 'center' }}>
                    <LinearProgress value={((expectedImageCount - missingImageCount) / expectedImageCount) * 100} variant="determinate" style={{ flex: "1" }} />
                    <div style={{ width: "170px" }}>
                        {(expectedImageCount - missingImageCount)}/{expectedImageCount} images generated ({Math.floor(((expectedImageCount - missingImageCount) / expectedImageCount) * 100)}%)
                    </div>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: 'center' }}>
                    <LinearProgress value={(progress?.progress ?? 0) * 100} variant={activeJobIsGrid ? "determinate" : "indeterminate"} style={{ flex: "1" }} />
                    <div style={{ width: "170px" }}>{activeJob
                        ? activeJobIsGrid
                            ? <>{Math.floor((progress?.progress ?? 0) * 100)}% ({progress?.eta_relative.toFixed(2)}s remaining)</>
                            : <>Processing another job</>
                        : <>Waiting for next job</>}</div>
                </div>
            </div>

        </Card>}


        <div style={{ flex: "1", overflowY: "auto", overflowX: 'auto', display: 'flex', flexDirection: 'column' }}>


            {/* Header */}
            <div style={{ display: 'flex', gap: "20px", padding: "0px 20px", position: "sticky", top: 0, zIndex: 2 }}>
                {/* Corner */}
                <div style={{ width: `${imageSize * .75}px`, flexShrink: '0' }} />
                {/* Column labels */}
                {grid.xVals.map(v => <div style={{ width: `${imageSize}px`, flexShrink: "0", textAlign: 'center', backgroundColor: "#0D0D0D", padding: "20px 0px" }}>{v}</div>)}
            </div>


            <div style={{ display: "flex" }}>

                {/* Row labels */}
                <div style={{ width: `${imageSize * .75}px`, flexShrink: "0", position: 'sticky', left: 0, zIndex: 1 }}>
                    {grid.yVals.map(val => <div style={{
                        height: `${imageSize + 40}px`, width: `${imageSize * .75}px`, flexShrink: "0",
                        display: 'flex', flexDirection: 'column', backgroundColor: "#0D0D0D",
                        justifyContent: 'center', alignItems: 'center'
                    }}>{val}</div>)}
                </div>

                {/* Images */}
                <div style={{ flexShrink: "0" }}>
                    {gridSizedArray<string>().map((row, r) => <div style={{
                        display: 'flex', gap: "20px", backgroundColor:
                            r % 2 === 0 ? "#1C1C1C" : "#151515"
                        , paddingLeft: "40px", paddingRight: "20px", paddingTop: "20px", paddingBottom: "20px",
                    }}>
                        {row.map((_, c) => {

                            const y = r
                            const x = c

                            if (imageMap?.[y]?.[x]) {
                                return <div style={{ width: `${imageSize}px`, height: `${imageSize}px`, aspectRatio: "1/1", flexShrink: "0" }} >
                                    <ImageTile
                                        image={imageMap[y][x]} onDelete={onDeleteImage} onFavorite={onFavorite}
                                        onClick={() => {
                                            setSelectedImage(imageMap[y][x])
                                            setViewerOpen(true)
                                        }}
                                    />
                                </div>
                            }

                            if (queueMap?.[y]?.[x]) {
                                return <div style={{ width: `${imageSize}px`, height: `${imageSize}px`, aspectRatio: "1/1", flexShrink: "0" }}>
                                    <QueuedImageTile
                                        prompt={queueMap[y][x]}
                                        onCancel={() => { cancelJob(queueMap[x][y].id ?? 0) }}
                                    />
                                </div>
                            }
                            const activeJobOrderData = activeJob?.orderData
                            if (activeJobOrderData && activeJobOrderData.xPos === x && activeJobOrderData.yPos === y) {
                                return <div style={{ width: `${imageSize}px`, height: `${imageSize}px`, aspectRatio: "1/1", flexShrink: "0" }}>
                                    <BrewingImageTile
                                        imageSrc={(progress?.current_image?.length ?? 0) === 0 ? "" : "data:image/png;base64," + progress?.current_image}
                                        eta={progress?.eta_relative}
                                        progress={(progress?.progress ?? 0) * 100}
                                    />
                                </div>
                            }

                            return <Card elevation={5} style={{ width: `${imageSize}px`, height: `${imageSize}px`, aspectRatio: "1/1", flexShrink: "0", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <img src="/outline.png" width={imageSize / 2} />
                            </Card>

                        })}
                    </div>)}
                </div>
            </div>
        </div >



        <ImageModal
            open={viewerOpen} setOpen={setViewerOpen} image={selectedImage} onAddAlbum={onAddAlbum} onDelete={() => { setDeleteAys(true) }}
            onDeleteForce={onDeleteImage} onDownload={onDownload} onLeft={onLeft} onRight={onRight} onFavorite={onFavorite} onRemoveAlbum={onRemoveAlbum}
            onUpdateNotes={onNotesUpdate} onUpscale={onUpscale} onViewAlbum={onViewAlbum}
        />

        <AreYouSureModal open={deleteAys} setOpen={setDeleteAys} title="Delete this image?" onYes={onDeleteImage} loading={delApi.loading}>
            Are you sure you want to delete this image?
        </AreYouSureModal>

        <GridEditor
            grid={editorState ?? grid} setGrid={setEditorState}
            open={editorOpen} setOpen={setEditorOpen} onOk={onEditorOk}
            loading={updateLoading} generated={imageApi?.images?.length > 0}
        />

    </>

}
