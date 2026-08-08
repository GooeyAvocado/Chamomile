import { useEffect, useMemo, useRef, useState } from "react";
import { FilterOptions } from "../../../model/FilterOptions";
import { useImages } from "../../hooks/useImages";
import ImageTile from "./ImageTile";
import ImageModal from "./ImageModal";
import { GeneratedImage } from "../../../model/GeneratedImage";
import { useSnackbar } from "notistack";
import { useImageUpload } from "../../hooks/useImageUpload";
import BrewingImageTile from "./BrewingImageTile";
import useApi from "../../hooks/useApi";
import { deleteImage, deleteMultiImage, favImage, interruptGeneration, noteImage } from "../../../api/Images";
import AreYouSureModal from "../modals/AreYouSureModal";
import { Alert, AlertTitle, Button, CircularProgress, Link, Stack } from "@mui/material";
import WelcomePane from "../welcome/WelcomePane";
import { useQueue } from "../../hooks/useQueue";
import QueuedImageTile from "./QueuedImageTile";
import useUserAgent from "../../hooks/useUserAgent";
import QueuedGroupImageTile from "./QueuedGroupImageTile";
import AdvSearchModal from "../filter/AdvSearchModal";
import AlbumWelcome from "../albums/AlbumWelcome";
import { Album } from "../../../model/Album";
import { updateImageAlbums } from "../../../api/Albums";
import ImageAlbumRequest from "../../../model/ImageAlbumRequest";
import ModelChangeTile from "./ModelChangeTile";
import ImageModalFromId from "./ImageModalFromId";
import { Prompt } from "../../../model/Prompt";
import SelectedImageActions from "../selectedImageActions/SelectedImageActions";
import { useLocation, useNavigate } from "react-router-dom";
import ContextMenu from "../ContextMenu";
import { Cancel } from "@mui/icons-material";
import { useSettings } from "../../hooks/useSettings";
import { TileSizeToPixels } from "../../contexts/SettingsContext";
import PromptOrderedModal from "../prompt/PromptOrderedModal";
// import ImageStrip from "./ImageStrip";

export default function ImageViewer(props: {
    filter: FilterOptions,
    setFilter?: (val: FilterOptions) => void
    showBrewing?: boolean,
    showWelcome?: boolean,
    onClick?: (val: GeneratedImage) => void
    selectedImages?: number[]
    setSelectedImages?: (val: number[]) => void,
    selectImage?: (id: number) => void
    unselectImage?: (id: number) => void
    onClearSelect?: () => void
    selectMode?: boolean
    album?: Album
    setAlbum?: (val: Album) => void
    navToSelectedImage?: boolean
}) {

    const {
        filter, showBrewing, onClick, showWelcome,
        album, setAlbum, selectImage, selectedImages,
        unselectImage, selectMode, onClearSelect,
        setSelectedImages, navToSelectedImage, setFilter
    } = props;

    const imageApi = useImages(filter);
    const delApi = useApi(deleteImage);
    const delMultipleApi = useApi(deleteMultiImage)
    const favApi = useApi(favImage)
    const notesApi = useApi(noteImage)
    const interruptApi = useApi(interruptGeneration)
    const updateImageAlbumsAPI = useApi(updateImageAlbums)
    const nav = useNavigate();
    const { settings } = useSettings();

    const [viewerOpen, setViewerOpen] = useState(false)
    const [deleteAys, setDeleteAys] = useState(false)
    const [uploadBrewBlob, setUploadBrewBlob] = useState(undefined as string | undefined)
    const [selectedImage, setSelectedImage] = useState(undefined as undefined | GeneratedImage)
    const [interruptOpen, SetInterruptOpen] = useState(false);
    const [advSearchOpen, setAdvSearchOpen] = useState(false);
    const [promptViewImageId, setPromptViewImageID] = useState<undefined | number>()

    const { enqueueSnackbar } = useSnackbar();
    const { isMobile } = useUserAgent();
    const { currentUpload, lastSuccess, progress: uploadProgress } = useImageUpload();
    const location = useLocation();

    const { activeJob, cancel, rush, delay, progress, groupedQueue, queue, nextModel } = useQueue((val) => {
        if (showBrewing && imageAlbumFilter(val) && !val.hidden) {
            imageApi.appendImage(val)
        }
    })

    //Clear the selected image if the image api loads more images 
    useEffect(() => {
        if (!viewerOpen) {
            setSelectedImage(undefined);
        }
    }, [imageApi.images]);

    const sentinelRef = useRef(null);

    useEffect(() => {
        imageApi.refresh()
    }, [filter])

    useEffect(() => {
        if (!navToSelectedImage) return;
        setViewerOpen(location.pathname.startsWith("/image"))
    }, [location, navToSelectedImage])

    useEffect(() => {
        if (showBrewing && lastSuccess !== undefined && !!lastSuccess?.id) {
            imageApi.appendImage(lastSuccess)
        }
    }, [lastSuccess])

    useEffect(() => {
        if (!showBrewing) return;
        if (uploadBrewBlob) URL.revokeObjectURL(uploadBrewBlob)
        if (currentUpload) setUploadBrewBlob(URL.createObjectURL(currentUpload))
    }, [currentUpload])

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    if (!imageApi.loading) imageApi.showMore()
                }
            },
            {
                threshold: 0.0,
                rootMargin: "200px"
            } // Trigger when fully visible
        );


        observer.observe(sentinel);
        return () => { observer.disconnect() };
    }, [sentinelRef.current, imageApi]);

    const onDelete = (override?: GeneratedImage) => {
        setDeleteAys(false)
        delApi.fetch(() => {
            enqueueSnackbar("Image deleted!", { variant: 'success' })
            if (selectedImage) {
                //If the count is 1, then we've deleted the last image
                if (imageApi.count === 1) {
                    setSelectedImage(undefined)
                    if (navToSelectedImage) nav("/")
                } else if (selectedIndex >= imageApi.count - 1) {
                    onLeft?.()
                } else {
                    onRight?.();
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


            if (album?.id === val.id) {
                if (selectedImage) {
                    //If the count is 1, then we've deleted the last image
                    if (imageApi.count === 1) {
                        setSelectedImage(undefined)
                    } else if (selectedIndex >= imageApi.count - 1) {
                        onLeft?.()
                    } else {
                        onRight?.();
                    }
                }
                imageApi.removeImage(selectedImage ?? {} as GeneratedImage)
            } else {
                imageApi.updateImage(newImg)
                setSelectedImage(newImg);
            }

            enqueueSnackbar("Removed from collection!", { variant: "success" })
        }, () => {
            enqueueSnackbar("Could not remove from collection", { variant: "error" })
        }, selectedImage?.id, {
            albumId: val.id,
            mode: "REMOVE"
        } as ImageAlbumRequest)


    }

    const onViewAlbum = setAlbum ? (val: Album) => {
        setAlbum(val)
        setViewerOpen(false)
    } : undefined

    const onInterrupt = () => {
        if (!activeJob) return;
        SetInterruptOpen(false);
        interruptApi.fetch(undefined, undefined, activeJob.id)
    }

    const selectedIndex = useMemo(() =>
        imageApi.images.map(a => a.id).indexOf(selectedImage?.id ?? 0)
        , [selectedImage, imageApi.images])

    const onLeft = selectedIndex === 0 ? undefined : () => {
        setSelectedImage(imageApi.images[selectedIndex - 1]);
    }

    //If this is the last image do nothing
    const onRight = selectedIndex === imageApi.images.length - 1 && !imageApi.hasMore ? undefined : () => {
        if (selectedIndex > imageApi.images.length - 4 && imageApi.hasMore && !imageApi.loading) { //If is the fourth to last image or later
            imageApi.showMore();
        };
        if (imageApi.images[selectedIndex + 1]) setSelectedImage(imageApi.images[selectedIndex + 1]);
    }

    const onHome = selectedIndex === 0 ? undefined : () => {
        setSelectedImage(imageApi.images[0]);
    }

    //If this is the last image do nothing
    const onEnd = selectedIndex === imageApi.images.length - 1 ? undefined : () => {
        if (imageApi.hasMore) { imageApi.showMore() }
        setSelectedImage(imageApi.images[imageApi.images.length - 1]);
    }

    const advanceBy = (count: number) => {

        //Easy cases:
        switch (count) {
            case 0:
                return;
            case 1:
                onRight?.();
                return;
            case -1:
                onLeft?.();
                return;
        }

        if (count < 0) {
            //Move left
            if (selectedIndex <= -count) { onHome?.(); }
            else { setSelectedImage(imageApi.images[selectedIndex + count]) }
            return;
        }

        //Move right
        if ((selectedIndex + count) >= imageApi.images.length) { onEnd?.(); }
        else {
            //If the user hits this button again, and we're going to overrun, load more
            //Assume the user is quickly browsing and want to get further
            if ((selectedIndex + (count * 2)) > imageApi.images.length && imageApi.hasMore) { imageApi.showMore(); }
            setSelectedImage(imageApi.images[selectedIndex + count])
        }


        return;
    }

    const filterIsEmpty = () => {
        return filter.favorite === false &&
            filter.upscaled === false &&
            filter.downloaded === false &&
            filter.fromDate?.trim().length === 0 &&
            filter.toDate?.trim().length === 0 &&
            filter.lora?.trim().length === 0 &&
            filter.model?.trim().length === 0 &&
            filter.query?.trim().length === 0
    }

    useEffect(() => { SetInterruptOpen(false) }, [activeJob])

    const imageAlbumFilter = (val: GeneratedImage) => {
        if (!album?.id) return true;
        return val.albums.includes(album.id)
    }

    const promptAlbumFilter = (val: Prompt) => {
        if (!album?.id) return true;
        return val.orderData?.albums?.includes(album.id)
    }

    const promptsAlbumFilter = (val: Prompt[]) => {
        if (!album?.id) return true;

        //This ternary is impossible but Eslint says otherwise. Go figure
        return val.some(a => a.orderData?.albums?.includes(album.id ?? 0))
    }

    const onSelectAll = () => {
        setSelectedImages?.(imageApi.images.map(a => a.id))
    }

    const onDeleteSelected = () => {
        delMultipleApi.fetch(() => {
            enqueueSnackbar("Images deleted!", { variant: "success" })
            setDeleteAys(false)
            handleDeleteSelectedSuccess()
        }, () => {
            enqueueSnackbar("Could not delete images", { variant: "error" })
        }, selectedImages)
    }

    const handleDeleteSelectedSuccess = () => {
        imageApi.removeImages(selectedImages ?? [])
        onClearSelect?.();
    }

    return <>
        {selectMode &&
            <SelectedImageActions
                selectedImageIds={selectedImages ?? []}
                onClearSelect={onClearSelect ?? (() => { })}
                albumId={album?.id}
                onAddToAlbum={(val) => {
                    selectedImages?.map(a => imageApi.images.find(b => b.id === a))
                        .filter(a => !!a).forEach((i) => {
                            imageApi.updateImage({ ...i, albums: [...i?.albums, val] })
                        })
                }}
                onSelectAll={onSelectAll}
                onDelete={handleDeleteSelectedSuccess}
            />
        }

        {imageApi.error &&
            <Stack sx={{ gap: "10px" }}>
                <Alert variant="standard" severity="error">
                    <AlertTitle>Could not retrieve images</AlertTitle>
                    {imageApi.error.message ? `Server responded: ${imageApi.error.message}` : "Something happened! Check the console"}
                </Alert>
                {imageApi.error.message?.includes("tsquery") && <Alert variant="standard" severity="info">
                    <AlertTitle>It looks like this is an Advanced Search related issue</AlertTitle>
                    <Link onClick={() => { setAdvSearchOpen(true) }} color="textPrimary">Learn about Advanced Search</Link>
                </Alert>}
            </Stack>
        }

        <div style={{ flex: "1", overflowY: 'auto', width: "100%", marginBottom: "20px" }}>


            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fill, minmax(${TileSizeToPixels(settings?.tileSize, isMobile)}px, 1fr))`,
                gap: '20px', overflowX: 'clip'
            }}>
                {showBrewing && groupedQueue.map(p =>
                    p.length === 0 || !promptsAlbumFilter(p) ? <></> :
                        p.length === 1
                            ? <QueuedImageTile prompt={p[0]}
                                onCancel={() => cancel(p[0].id ?? 0)}
                                onDelay={() => delay(p[0].id ?? 0)}
                                onRush={() => rush(p[0].id ?? 0)}
                                onView={setPromptViewImageID}
                            />
                            : <QueuedGroupImageTile prompts={p}
                                onCancel={cancel} onDelay={delay} onRush={rush}
                                onView={setPromptViewImageID}
                            />
                )}

                {showBrewing && nextModel && (groupedQueue?.length ?? 0) > 0 && <ModelChangeTile nextModel={nextModel} />}

                {showBrewing && activeJob && activeJob.orderData?.source !== "GRID" && promptAlbumFilter(activeJob) && <>
                    <ContextMenu options={[
                        { icon: <Cancel />, text: "Cancel", onClick: onInterrupt }
                    ]}>

                        <BrewingImageTile
                            imageSrc={(progress?.current_image?.length ?? 0) === 0 ? "" : "data:image/png;base64," + progress?.current_image}
                            eta={progress?.eta_relative} onClick={() => { SetInterruptOpen(true) }} progress={(progress?.progress ?? 0) * 100}
                        />
                    </ContextMenu>

                    <PromptOrderedModal
                        jobId={activeJob?.id ?? 0}
                        onCancel={onInterrupt}
                        open={interruptOpen} prompt={activeJob}
                        setOpen={SetInterruptOpen}
                        progress={progress}
                    />


                </>}

                {showBrewing && currentUpload && <>
                    <BrewingImageTile imageSrc={uploadBrewBlob ?? ""} progress={uploadProgress} />
                </>}

                {imageApi.images?.map(a => <ImageTile
                    key={`image-${a.id}`} image={a} onDelete={onDelete} filter={filter} setFilter={setFilter}
                    onFavorite={onFavorite} selected={selectedImages?.includes(a.id)} onDownload={onDownload} onUpscale={onUpscale}
                    onSelect={selectImage ? () => selectImage(a.id) : undefined} onUnselect={unselectImage ? () => unselectImage(a.id) : undefined} selectMode={selectMode}
                    onClick={onClick ? () => { onClick(a) } : () => { setSelectedImage(a); setViewerOpen(true); if (navToSelectedImage) nav(`/image`) }}
                    highlighted={selectedImage?.id === a.id} modalOpen={viewerOpen}
                    onSelectAll={onSelectAll} onDeselectAll={onClearSelect} onDeleteSelected={() => {
                        setDeleteAys(true)
                    }}
                />)}

                {!onClick && <>
                    <ImageModal
                        open={viewerOpen} setOpen={() => {
                            setViewerOpen(false);
                            if (navToSelectedImage) nav("/")
                        }} image={selectedImage} filter={filter} setFilter={setFilter ? (val) => {
                            setFilter(val)
                            setViewerOpen(false)
                        } : undefined} moreLoading={imageApi.loading}
                        onDelete={() => setDeleteAys(true)} onDeleteForce={onDelete} onUpdateNotes={onNotesUpdate}
                        onFavorite={onFavorite} onDownload={onDownload}
                        onLeft={onLeft} onRight={onRight} onHome={onHome} onEnd={onEnd}
                        // onUp={() => advanceBy(-5)} onDown={() => advanceBy(5)}
                        onPageUp={() => advanceBy(-10)} onPageDown={() => advanceBy(10)}
                        onUpscale={onUpscale} onAddAlbum={onAddAlbum} onRemoveAlbum={onRemoveAlbum} onViewAlbum={onViewAlbum}
                        imageChildren={() => <div style={{
                            position: "absolute", bottom: "10px", right: "10px", zIndex: 2, textAlign: 'right',
                            opacity: '.5'
                        }}>
                            {/* <div style={{ mixBlendMode: 'color', marginBottom: '5px' }}>
                                <ImageStrip images={imageApi.images.slice(selectedIndex, selectedIndex + 3).map(a => a.id)} maxLength={3} imageSize="16px" />
                            </div> */}
                            <div style={{ fontSize: ".6em", color: 'white', mixBlendMode: 'color-dodge' }}>
                                {(selectedIndex + 1).toLocaleString()} of {imageApi?.count?.toLocaleString()}
                            </div>
                        </div>}
                    />
                    <AreYouSureModal open={deleteAys} setOpen={setDeleteAys} title={
                        selectMode ? "Delete all selected images?" : "Delete this image?"
                    } onYes={selectMode ? onDeleteSelected : onDelete} loading={delApi.loading}>
                        {
                            selectMode
                                ? <>
                                    <div>Are you sure you want to do this?</div>
                                    <div>This will delete {selectedImages?.length} image(s)</div>
                                </>
                                : <>Are you sure you want to delete this image?</>
                        }
                    </AreYouSureModal>
                </>}

                {promptViewImageId && <ImageModalFromId open={!!promptViewImageId} setOpen={() => setPromptViewImageID(undefined)} image={promptViewImageId} />}

            </div>
            {imageApi.count === 0 && !activeJob && (queue?.length ?? 0) === 0 && <>
                {filterIsEmpty() && !imageApi.loading && showWelcome ? <>{album ? <AlbumWelcome /> : <WelcomePane />}</>
                    : <div style={{ height: '100%', display: "flex", flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        {imageApi.loading ? <>
                            <img src="brewing.gif" style={{ width: "128px" }} />
                            <div style={{ marginTop: "-20px" }}>Loading images</div>
                        </> : <>
                            <img src="outlinepadded.png" style={{ width: "128px" }} />
                            <div style={{ marginTop: "-20px" }}>No images!</div>
                        </>}
                    </div>}
            </>}
            {imageApi.hasMore && (imageApi.images?.length ?? 0) > 0 && <>
                <div style={{ textAlign: 'center', marginTop: "20px" }}>
                    <Button
                        size="small" onClick={() => imageApi.showMore()}
                        disabled={imageApi.loading} ref={sentinelRef}
                    >
                        {imageApi.loading ? <CircularProgress size={24} /> : "Show More"}
                    </Button>
                    <div style={{ fontSize: ".7em" }}>Showing {imageApi.images.length.toLocaleString()} of {imageApi.count.toLocaleString()} images</div>
                </div>
            </>}
            <AdvSearchModal onClose={() => setAdvSearchOpen(false)} open={advSearchOpen} />
        </div>

    </>


}