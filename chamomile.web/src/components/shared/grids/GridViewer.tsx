import { Alert, Button, Card, CardActionArea, IconButton, LinearProgress, Switch, Tooltip } from "@mui/material";
import { Grid } from "../../../model/Grid";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import { ArrowBack, BorderClear, Cancel, Coffee, CopyAll, Delete, Edit } from "@mui/icons-material";
import { FilterOptions } from "../../../model/FilterOptions";
import { useImages } from "../../hooks/useImages";
import { useQueue } from "../../hooks/useQueue";
import { GeneratedImage } from "../../../model/GeneratedImage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import useApi from "../../hooks/useApi";
import { cancelJobs, deleteImage, deleteMultiImage, enqueueGrid, favImage, interruptGeneration, noteImage } from "../../../api/Images";
import { updateImageAlbums } from "../../../api/Albums";
import { Album } from "../../../model/Album";
import ImageAlbumRequest from "../../../model/ImageAlbumRequest";
import { useNavigate } from "react-router-dom";
import { Prompt } from "../../../model/Prompt";
import { createGrid, updateGrid } from "../../../api/Grid";
import GridEditor from "./GridEditor";
import ImageModal from "../images/ImageModal";
import AreYouSureModal from "../modals/AreYouSureModal";
import QueuedImageTile from "../images/QueuedImageTile";
import { GridType, GridTypes } from "./GridTypes";
import BrewingImageTile from "../images/BrewingImageTile";
import PromptOrderData from "../../../model/PromptOrderData";
import ImageTile from "../images/ImageTile";
import GenerateGridRequest, { GenerateGridCoords } from "../../../model/GenerateGridRequest";
import ContextMenu from "../ContextMenu";
import PromptOrderedModal from "../prompt/PromptOrderedModal";
import { useSettings } from "../../hooks/useSettings";
import { TileSizeToPixels } from "../../contexts/SettingsContext";

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
    const [filter, setFilter] = useState({
        grid: grid.id,
        disablePagination: true
    } as FilterOptions)

    useEffect(() => {
        if (filter.grid !== grid.id) {
            setFilter({
                grid: grid.id,
                disablePagination: true
            })
        }
    }, [grid])

    const imageApi = useImages(filter)
    const delApi = useApi(deleteImage);
    const delMultiApi = useApi(deleteMultiImage)
    const cancelMultiApi = useApi(cancelJobs)
    const interruptApi = useApi(interruptGeneration)
    const favApi = useApi(favImage)
    const notesApi = useApi(noteImage)
    const brewApi = useApi(enqueueGrid)
    const { fetch: update, loading: updateLoading } = useApi(updateGrid)
    const { fetch: create, loading: createLoading } = useApi(createGrid)
    const updateImageAlbumsAPI = useApi(updateImageAlbums)
    const nav = useNavigate();
    const { settings } = useSettings();

    const { activeJob, queue, progress, cancel: cancelJob, delay, rush } = useQueue((val) => {
        if ((val.additionalInfo as PromptOrderData).gridId === grid.id) imageApi.appendImage(val)
    })

    const [deleteAys, setDeleteAys] = useState(false)
    const [clearAys, setClearAys] = useState(false)
    const [editorOpen, setEditorOpen] = useState(false)
    const [interruptOpen, SetInterruptOpen] = useState(false)
    const [duplicate, setDuplicate] = useState(false)
    const [viewerOpen, setViewerOpen] = useState(false)
    const [rerollSeed, setRerollSeed] = useState(true)
    const [editorState, setEditorState] = useState<Grid>()
    const [selectedImage, setSelectedImage] = useState(undefined as undefined | GeneratedImage)

    const [multiSelectMode, setMultiSelectMode] = useState(false);
    const [multiSelectImages, setMultiSelectImages] = useState([] as number[])

    const multiSelectImage = (id: number) => {
        setMultiSelectImages([...multiSelectImages, id])
    }

    const unselectMultiSelectImage = (id: number) => {
        setMultiSelectImages([...multiSelectImages].filter(a => a !== id));
    }


    const onDeleteImage = (override?: GeneratedImage) => {
        setDeleteAys(false)
        delApi.fetch(() => {
            enqueueSnackbar("Image deleted!", { variant: 'success' })
            if (selectedImage) {
                //Legitimately find *anywhere* to send the viewer to
                setSelectedImage([
                    getDestinationImage("left"),
                    getDestinationImage("up"),
                    getDestinationImage("right"),
                    getDestinationImage("down"),
                ].filter(a => !!a)[0])

            }
            imageApi.removeImage(override ?? selectedImage ?? {} as GeneratedImage)
        }, () => {
            enqueueSnackbar("Image could not be deleted!", { variant: 'error' })
        }, (override ?? selectedImage)?.id)
    }

    const onDeleteSelected = () => {
        delMultiApi.fetch(() => {
            enqueueSnackbar("Images deleted!", { variant: "success" })
            setDeleteAys(false)
            onDeselectAll();
            imageApi.removeImages(multiSelectImages)
        }, () => {
            enqueueSnackbar("Could not delete images", { variant: "error" })
        }, multiSelectImages)
    }
    const onDeselectAll = () => {
        setMultiSelectImages([])
        setMultiSelectMode(false)
    }

    const onClearGrid = () => {
        setClearAys(false)

        if (rerollSeed) {
            const newGrid = {
                ...grid,
                seed: Math.floor(Math.random() * 1000000000)
            } as Grid
            update(() => {
                setGrid(newGrid)
            }, undefined, newGrid)
        }


        delMultiApi.fetch(() => {
            enqueueSnackbar("Grid cleared!", { variant: 'success' })
            imageApi.refresh();
        }, () => {
            enqueueSnackbar("Image could not be deleted!", { variant: 'error' })
        }, imageApi.images.map(a => a.id))
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
        const img = { ...selectedImage, downloadCount: (selectedImage.downloadCount ?? 0) + 1 } as GeneratedImage;
        imageApi.updateImage(img)
        setSelectedImage(img)
    }

    const onUpscale = (val: GeneratedImage) => {
        imageApi.updateImage(val ?? selectedImage)
        setSelectedImage((prev) => prev?.id === val.id ? val : prev);
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
            if (!r[i.additionalInfo?.yPos ?? 0]) return r;
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
    const currentCol = selectedImage?.additionalInfo?.xPos ?? 0
    const currentRow = selectedImage?.additionalInfo?.yPos ?? 0

    //#region Navigation
    type Direction = 'left' | 'right' | 'up' | 'down';

    function getDestinationImage(direction: Direction): GeneratedImage | undefined {
        const isHorizontal = direction === 'left' || direction === 'right';
        const isForward = direction === 'right' || direction === 'down';

        // Pull out the row or column we're scanning along
        const line = isHorizontal
            ? imageMap[currentRow]
            : imageMap.map(row => row[currentCol]);

        const currentIndex = isHorizontal ? currentCol : currentRow;

        const candidates = (isForward
            ? line.slice(currentIndex + 1)
            : line.slice(0, currentIndex)
        ).filter(i => !!i);

        // Forward directions want the nearest one (first in slice), backward wants the nearest too (last in slice)
        return isForward ? candidates[0] : candidates[candidates.length - 1];
    }
    //#endregion

    const onLeft = () => {
        const destination = getDestinationImage("left");
        if (destination) setSelectedImage(destination)
    }

    const onRight = () => {
        const destination = getDestinationImage("right");
        if (destination) setSelectedImage(destination)
    }

    const onHome = () => {
        const row = imageMap[currentRow] ?? [];
        const firstIndex = row.findIndex(i => i !== undefined);
        if (firstIndex !== -1) {
            setSelectedImage(row[firstIndex]);
            return;
        }
    }

    const onEnd = () => {
        const row = imageMap[currentRow] ?? [];
        let lastIndex = -1;
        for (let i = row.length - 1; i >= 0; i--) {
            if (row[i] !== undefined) {
                lastIndex = i;
                break;
            }
        }
        if (lastIndex !== -1) {
            setSelectedImage(row[lastIndex]);
            return;
        }
    }

    const onUp = () => {
        const destination = getDestinationImage("up");
        if (destination) setSelectedImage(destination)
    }

    const onDown = () => {
        const destination = getDestinationImage("down");
        if (destination) setSelectedImage(destination)
    }


    const queueMissingImages = () => {

        const allCoords = [] as GenerateGridCoords[]
        const xType = GridTypes.find(a => a.code === grid.xValMode)
        const yType = GridTypes.find(a => a.code === grid.yValMode)
        if (!xType || !yType) {
            enqueueSnackbar("Unknown axis modes set",)
            return;
        };

        gridSizedArray<string>().forEach((r, y) => {
            r.forEach((_, x) => {
                const alreadyBrewed = !!imageMap?.[y]?.[x]
                const alreadyQueued = !!queueMap?.[y]?.[x]
                const inProgress = activeJob?.orderData?.xPos === x &&
                    activeJob?.orderData?.yPos === y &&
                    activeJob?.orderData?.gridId === grid.id;

                if (!alreadyBrewed && !alreadyQueued && !inProgress) {
                    allCoords.push({ x, y })
                }
            })
        })

        brewApi.fetch((val) => {
            enqueueSnackbar(`${val?.jobIds.length} orders placed!`, { variant: 'success' })
        }, () => {
            enqueueSnackbar("Could not queue images!", { variant: 'error' })
        }, { id: grid.id, coordinates: allCoords } as GenerateGridRequest)
    }

    const onEdit = () => {
        setEditorState(grid)
        setDuplicate(false);
        setEditorOpen(true)
    }
    const onDuplicate = () => {
        setEditorState(grid)
        setDuplicate(true);
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



        if (duplicate) {
            create((val) => {
                enqueueSnackbar("Grid duplicated!", { variant: "success" })
                setGrid(val)
                nav(`/grid/${val?.id}`)
                setEditorOpen(false)
            }, () => {
                enqueueSnackbar("Could not duplicate grid", { variant: "error" })
            }, { ...editorState, seed: Math.floor(Math.random() * 1000000000) } as Grid)
        } else {
            update((val) => {
                enqueueSnackbar("Grid updated!", { variant: "success" })
                setGrid(val)
                setEditorOpen(false)
            }, () => {
                enqueueSnackbar("Could not update grid", { variant: "error" })
            }, editorState)
        }

    }

    const expectedImageCount = grid.xVals.length * grid.yVals.length;
    const missingImageCount = expectedImageCount - imageApi?.images?.length
    const inProgressImages = filteredQueue.length
    const allMissingInProgress = missingImageCount === 0 || missingImageCount === inProgressImages + (activeJob?.orderData?.gridId === grid.id ? 1 : 0)
    const allMissing = imageApi?.images?.length === 0 && !allMissingInProgress

    const xType = GridTypes.find(a => a.code === grid.xValMode)
    const yType = GridTypes.find(a => a.code === grid.yValMode)

    const imageSize = TileSizeToPixels(settings.tileSize)
    const labelHeight = 50;
    const labelMargin = 10;


    const onInterrupt = () => {
        if (!activeJob) return;
        SetInterruptOpen(false);
        interruptApi.fetch(undefined, undefined, activeJob.id)
    }

    const selectAll = useCallback(() => {
        const allIds = imageMap
            .flat()
            .filter((img): img is GeneratedImage => img != null)
            .map(img => img.id);

        setMultiSelectImages(allIds);
    }, [imageMap]);

    const selectAllInRow = useCallback((rowIndex: number) => {
        setMultiSelectMode(true)
        const rowIds = (imageMap[rowIndex] ?? [])
            .filter((img): img is GeneratedImage => img != null)
            .map(img => img.id);

        setMultiSelectImages(prev => Array.from(new Set([...prev, ...rowIds])));
    }, [imageMap]);

    const selectAllInColumn = useCallback((colIndex: number) => {
        setMultiSelectMode(true)
        const colIds = imageMap
            .map(row => row[colIndex])
            .filter((img): img is GeneratedImage => img != null)
            .map(img => img.id);

        setMultiSelectImages(prev => Array.from(new Set([...prev, ...colIds])));
    }, [imageMap]);


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
                            <Tooltip title="Edit grid"><IconButton onClick={() => onEdit()}><Edit fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Duplicate grid"><IconButton onClick={() => onDuplicate()}><CopyAll fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Clear grid"><IconButton onClick={() => { setClearAys(true); setRerollSeed(true) }}><BorderClear fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Delete grid"><IconButton onClick={() => onDelete()}><Delete fontSize="small" /></IconButton></Tooltip>
                        </div>
                    </div>

                </div>


            </div>

        </div>

        <hr style={{ width: "100%" }} />
        {!imageApi.loading && !allMissingInProgress && <Card style={{ padding: "5px 10px" }}>
            <Alert severity={allMissing ? "info" : "warning"} style={{ padding: "5px 10px" }} action={
                <Button
                    onClick={queueMissingImages} startIcon={<Coffee />} variant="outlined" color={allMissing ? "info" : "warning"}
                    size="small" style={{ marginRight: '8px', marginTop: "-2px" }}
                >
                    Brew{allMissing ? "" : " remaining"} images
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

            <Button
                variant="outlined" size="small"
                onClick={() => cancelMultiApi.fetch(undefined, undefined, filteredQueue.map(a => a.id))}
            >Cancel</Button>

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
                <div style={{ width: `${labelHeight + (2 * labelMargin)}px`, flexShrink: '0', textAlign: "center", }} />
                {/* Column labels */}
                {grid.xVals.map((v, i) => <GridAxisLabel
                    imageSize={imageSize} type={xType} value={v}
                    labelHeight={labelHeight} labelMargin={labelMargin}
                    onClick={() => selectAllInColumn(i)}
                />)}
            </div>


            <div style={{ display: "flex", width: "fit-content" }}>

                {/* Row labels */}
                <div style={{
                    flexShrink: "0", position: 'sticky', left: 0, zIndex: 1, writingMode: "sideways-lr", textOrientation: 'mixed',
                    display: "flex", gap: "40px", flexDirection: 'row-reverse', marginTop: "20px"
                }}>
                    {grid.yVals.map((v, i) => <GridAxisLabel
                        imageSize={imageSize} value={v} type={yType} vertical
                        labelHeight={labelHeight} labelMargin={labelMargin}
                        onClick={() => selectAllInRow(i)}
                    />)}
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
                                        onSelect={() => {
                                            multiSelectImage(imageMap[y][x].id)
                                            setMultiSelectMode(true)
                                        }}
                                        onUnselect={() => {
                                            unselectMultiSelectImage(imageMap[y][x].id)
                                            if (multiSelectImages.length === 1) setMultiSelectMode(false)
                                        }}
                                        onSelectAll={selectAll} onDeselectAll={onDeselectAll}
                                        onDeleteSelected={() => setDeleteAys(true)}
                                        selectMode={multiSelectMode} selected={multiSelectImages.includes(imageMap[y][x].id)}
                                        image={imageMap[y][x]} onDelete={onDeleteImage} onFavorite={onFavorite} onDownload={onDownload}
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
                                        onCancel={() => { cancelJob(queueMap[y][x].id ?? 0) }}
                                        onDelay={() => { delay(queueMap[y][x].id ?? 0) }}
                                        onRush={() => { rush(queueMap[y][x].id ?? 0) }}
                                    />
                                </div>
                            }
                            const activeJobOrderData = activeJob?.orderData
                            if (activeJobOrderData && activeJobOrderData?.gridId === grid.id && activeJobOrderData.xPos === x && activeJobOrderData.yPos === y) {
                                return <div style={{ width: `${imageSize}px`, height: `${imageSize}px`, aspectRatio: "1/1", flexShrink: "0" }}>
                                    <ContextMenu options={[
                                        { icon: <Cancel />, text: "Cancel", onClick: onInterrupt }
                                    ]}>

                                        <BrewingImageTile
                                            imageSrc={(progress?.current_image?.length ?? 0) === 0 ? "" : "data:image/png;base64," + progress?.current_image}
                                            eta={progress?.eta_relative} onClick={() => SetInterruptOpen(true)}
                                            progress={(progress?.progress ?? 0) * 100}
                                        />

                                    </ContextMenu>

                                    <PromptOrderedModal
                                        jobId={activeJob?.id ?? 0}
                                        onCancel={onInterrupt}
                                        open={interruptOpen} prompt={activeJob}
                                        setOpen={SetInterruptOpen}
                                        progress={progress}
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
            onUpdateNotes={onNotesUpdate} onUpscale={onUpscale} onViewAlbum={onViewAlbum} onUp={onUp} onDown={onDown} onHome={onHome} onEnd={onEnd}
            imageChildren={() => <GridImageHUD
                xPos={selectedImage?.additionalInfo?.xPos ?? 0} yPos={selectedImage?.additionalInfo?.yPos ?? 0}
                xVal={selectedImage?.additionalInfo?.xVal ?? ""} yVal={selectedImage?.additionalInfo?.yVal ?? ""}
                xSize={grid?.xVals?.length} ySize={grid?.yVals?.length} xType={xType} yType={yType}
            />}
        />

        <AreYouSureModal
            open={deleteAys} setOpen={setDeleteAys} title={multiSelectMode ? "Delete all selected images?" : "Delete this image?"}
            onYes={multiSelectMode ? onDeleteSelected : onDeleteImage} loading={delApi.loading}
        >
            {multiSelectMode ?
                <>
                    <div>Are you sure you want to do this?</div>
                    <div>This will delete {multiSelectImages?.length} images</div>
                </>
                : <>Are you sure you want to delete this image?</>}
        </AreYouSureModal>

        <AreYouSureModal open={clearAys} setOpen={setClearAys} title="Clear this grid?" onYes={onClearGrid} loading={delApi.loading}>
            <div>This will delete all images on this grid</div>
            <div style={{ display: 'flex', gap: "16px", alignItems: 'center', marginTop: "16px" }}>
                <Switch checked={rerollSeed} onChange={(_, checked) => setRerollSeed(checked)} size="small" />
                <div style={{ fontSize: ".9em" }}>
                    <div>Reroll seed</div>
                    <div style={{ fontSize: ".7em" }}>
                        This will set a new seed for this grid
                    </div>

                </div>
            </div>
        </AreYouSureModal>

        <GridEditor
            grid={editorState ?? grid} setGrid={setEditorState}
            open={editorOpen} setOpen={setEditorOpen} onOk={onEditorOk}
            loading={updateLoading || createLoading} generated={imageApi?.images?.length > 0}
            duplicate={duplicate} imageMap={imageMap} readOnly={filteredQueue.length > 0 || activeJobIsGrid}
        />

    </>

}

function GridAxisLabel({ imageSize, value, type, vertical, labelHeight, labelMargin, onClick }: {
    value: string,
    type?: GridType
    imageSize: number
    labelHeight: number
    labelMargin: number
    vertical?: boolean
    onClick?: () => void
}) {
    return <Card style={{
        width: `${vertical ? labelHeight : imageSize}px`, height: `${vertical ? imageSize : labelHeight}px`,
        flexShrink: "0", textAlign: 'center', margin: vertical ? `0px ${labelMargin}px` : `${labelMargin}px 0px`
    }}>
        <Tooltip title={<div style={{ padding: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: "5px" }}>
                {type?.prefix}
                <div>{type?.name}</div>
            </div>
            <hr />
            <div>{type?.displayValue?.(value) ?? value}{type?.suffix}</div>
        </div>}>
            <CardActionArea onClick={onClick} style={{
                padding: "16px 20px",
                [vertical ? "width" : "height"]: `${labelHeight}px`,
                [vertical ? "height" : "width"]: `100%`,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                wordBreak: "break-all",
                fontSize: ".8em"
            }}>
                {type?.displayValue?.(value) ?? value}{type?.suffix}
            </CardActionArea>
        </Tooltip>
    </Card>
}

function GridImageHUD({
    xPos, yPos,
    xSize, ySize,
    xType, yType,
    xVal, yVal
}: {
    xPos: number,
    yPos: number,
    xSize: number,
    ySize: number,
    xVal: string,
    yVal: string,
    xType?: GridType
    yType?: GridType
}) {

    const [hovered, setHovered] = useState(false)

    const activeColor = "#02678fff"
    const inactiveColor = "#000"
    const cellSize = 8

    const nwCorner = xPos === 0 && yPos === 0
    const neCorner = xPos === xSize - 1 && yPos === 0
    const swCorner = xPos === 0 && yPos === ySize - 1
    const seCorner = xPos === xSize - 1 && yPos === ySize - 1
    const nEdge = yPos === 0 && !nwCorner && !neCorner
    const sEdge = yPos === ySize - 1 && !swCorner && !seCorner
    const wEdge = xPos === 0 && !nwCorner && !swCorner
    const eEdge = xPos === xSize - 1 && !neCorner && !seCorner
    const somewhereElse = xPos > 0 && yPos > 0 && xPos < xSize - 1 && yPos < ySize - 1

    return <div style={{ position: 'absolute', left: "20px", top: '20px', zIndex: '2' }}>
        <Card style={{ padding: "10px", opacity: hovered ? "1" : "0.2", transition: "opacity 0.2s ease" }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <div style={{ display: 'flex', gap: "10px", alignItems: 'center' }}>

                <div style={{ width: "32px", height: "32px", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: "2px" }}>
                    <div style={{ display: 'flex', gap: "2px" }}>
                        <div style={{ width: `${cellSize}px`, height: `${cellSize}px`, backgroundColor: nwCorner ? activeColor : inactiveColor }} />
                        <div style={{ width: `${cellSize}px`, height: `${cellSize}px`, backgroundColor: nEdge ? activeColor : inactiveColor }} />
                        <div style={{ width: `${cellSize}px`, height: `${cellSize}px`, backgroundColor: neCorner ? activeColor : inactiveColor }} />
                    </div>
                    <div style={{ display: 'flex', gap: "2px" }}>
                        <div style={{ width: `${cellSize}px`, height: `${cellSize}px`, backgroundColor: wEdge ? activeColor : inactiveColor }} />
                        <div style={{ width: `${cellSize}px`, height: `${cellSize}px`, backgroundColor: somewhereElse ? activeColor : inactiveColor }} />
                        <div style={{ width: `${cellSize}px`, height: `${cellSize}px`, backgroundColor: eEdge ? activeColor : inactiveColor }} />
                    </div>
                    <div style={{ display: 'flex', gap: "2px" }}>
                        <div style={{ width: `${cellSize}px`, height: `${cellSize}px`, backgroundColor: swCorner ? activeColor : inactiveColor }} />
                        <div style={{ width: `${cellSize}px`, height: `${cellSize}px`, backgroundColor: sEdge ? activeColor : inactiveColor }} />
                        <div style={{ width: `${cellSize}px`, height: `${cellSize}px`, backgroundColor: seCorner ? activeColor : inactiveColor }} />
                    </div>
                </div>
                <div style={{ fontFamily: 'monospace', textAlign: "center" }}>
                    <div>{xPos},{yPos}</div>
                    <div style={{ fontSize: ".5em" }}>X,Y</div>
                </div>
                <div>
                    <div style={{ display: 'flex', gap: "10px", alignItems: 'center', fontSize: ".8em", fontFamily: 'monospace' }}>
                        {xType?.prefix}
                        <div
                            style={{
                                width: "200px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                textAlign: 'left'
                            }}
                        >
                            {xVal?.trim().length === 0 ? "(Nothing)" : xVal}{xType?.suffix}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: "10px", alignItems: 'center', fontSize: ".8em", fontFamily: 'monospace' }}>
                        {yType?.prefix}
                        <div style={{
                            width: "200px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            textAlign: 'left'
                        }}>
                            {yVal?.trim().length === 0 ? "(Nothing)" : yVal}{yType?.suffix}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    </div>
}

