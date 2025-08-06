import { useEffect, useState } from "react";
import { FilterOptions } from "../../../model/FilterOptions";
import { useImages } from "../../hooks/useImages";
import ImageTile from "./ImageTile";
import ImageModal from "./ImageModal";
import { GeneratedImage } from "../../../model/GeneratedImage";
import { useSnackbar } from "notistack";
import { useImageUpload } from "../../hooks/useImageUpload";
import BrewingImageTile from "./BrewingImageTile";
import useApi from "../../hooks/useApi";
import { deleteImage, favImage, noteImage } from "../../../api/Images";
import AreYouSureModal from "../modals/AreYouSureModal";
import { Alert, AlertTitle, Button, CircularProgress, Link, Stack } from "@mui/material";
import WelcomePane from "../welcome/WelcomePane";
import { useQueue } from "../../hooks/useQueue";
import QueuedImageTile from "./QueuedImageTile";
import PromptEditorModal from "../prompt/PromptEditorModal";
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

export default function ImageViewer(props: {
    filter: FilterOptions
    showBrewing?: boolean,
    showWelcome?: boolean,
    onClick?: (val: GeneratedImage) => void
    album?: Album
    setAlbum?: (val: Album) => void
}) {

    const { filter, showBrewing, onClick, showWelcome, album, setAlbum } = props;
    const imageApi = useImages(filter);
    const delApi = useApi(deleteImage);
    const favApi = useApi(favImage)
    const notesApi = useApi(noteImage)
    const updateImageAlbumsAPI = useApi(updateImageAlbums)

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

    const { activeJob, cancel, progress, groupedQueue, queue, nextModel } = useQueue((val) => {
        if (showBrewing && imageAlbumFilter(val)) {
            imageApi.appendImage(val)
        }
    })

    useEffect(() => {
        imageApi.refresh()
    }, [filter])

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

    const onDelete = (override?: GeneratedImage) => {
        setDeleteAys(false)
        delApi.fetch(() => {
            enqueueSnackbar("Image deleted!", { variant: 'success' })
            if (selectedImage) {
                //If the count is 1, then we've deleted the last image
                if (imageApi.count === 1) {
                    setSelectedImage(undefined)
                } else if (selectedIndex() >= imageApi.count - 1) {
                    onLeft()
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


            if (album?.id === val.id) {
                if (selectedImage) {
                    //If the count is 1, then we've deleted the last image
                    if (imageApi.count === 1) {
                        setSelectedImage(undefined)
                    } else if (selectedIndex() >= imageApi.count - 1) {
                        onLeft()
                    } else {
                        onRight();
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

    const selectedIndex = () => {
        return imageApi.images.map(a => a.id).indexOf(selectedImage?.id ?? 0);
    }

    const onLeft = () => {
        const index = selectedIndex();
        if (index === 0) return;
        setSelectedImage(imageApi.images[index - 1]);
    }

    const onRight = () => {
        const index = selectedIndex();
        if (index === imageApi.images.length - 1) return; //If this is the last image do nothing
        if (index === imageApi.images.length - 2) { //If is the second to last image
            if (imageApi.hasMore) imageApi.showMore();
        };
        setSelectedImage(imageApi.images[index + 1]);
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

    return <>
        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '128' : 128 + 32 + 16}px, 1fr))`,
            gap: '20px'
        }}>
            {showBrewing && groupedQueue.map(p =>
                p.length === 0 || !promptsAlbumFilter(p) ? <></> :
                    p.length === 1 ? <QueuedImageTile prompt={p[0]} onCancel={() => cancel(p[0].id)} onView={setPromptViewImageID} /> :
                        <QueuedGroupImageTile prompts={p} onCancel={cancel} onView={setPromptViewImageID} />
            )}

            {showBrewing && nextModel && <ModelChangeTile nextModel={nextModel} />}

            {showBrewing && activeJob && promptAlbumFilter(activeJob) && <>
                <BrewingImageTile
                    imageSrc={(progress?.current_image?.length ?? 0) === 0 ? "" : "data:image/png;base64," + progress?.current_image}
                    eta={progress?.eta_relative} onClick={() => { SetInterruptOpen(true) }} progress={(progress?.progress ?? 0) * 100}
                />

                <PromptEditorModal onOk={() => { }} open={interruptOpen} prompt={activeJob} setOpen={SetInterruptOpen} title="Brewing image" preview progress={progress} />
            </>}

            {showBrewing && currentUpload && <>
                <BrewingImageTile imageSrc={uploadBrewBlob ?? ""} progress={uploadProgress} />
            </>}

            {imageApi.images?.map(a => <ImageTile
                key={`image-${a.id}`} image={a} onDelete={onDelete}
                onFavorite={onFavorite}
                onClick={onClick ? () => { onClick(a) } : () => { setSelectedImage(a); setViewerOpen(true) }}
            />)}

            {!onClick && <>
                <ImageModal
                    open={viewerOpen} setOpen={setViewerOpen} image={selectedImage}
                    onDelete={() => setDeleteAys(true)} onDeleteForce={onDelete} onUpdateNotes={onNotesUpdate}
                    onFavorite={onFavorite} onDownload={onDownload} onLeft={onLeft} onRight={onRight}
                    onUpscale={onUpscale} onAddAlbum={onAddAlbum} onRemoveAlbum={onRemoveAlbum} onViewAlbum={onViewAlbum}
                />
                <AreYouSureModal open={deleteAys} setOpen={setDeleteAys} title="Delete this image?" onYes={onDelete} loading={delApi.loading}>
                    Are you sure you want to delete this image?
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
        {imageApi.error &&
            <Stack gap={"10px"}>
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
        {imageApi.hasMore && (imageApi.images?.length ?? 0) > 0 && <>
            <div style={{ textAlign: 'center', marginTop: "20px" }}>
                <Button size="small" onClick={() => imageApi.showMore()} disabled={imageApi.loading}> {imageApi.loading ? <CircularProgress size={24} /> : "Show More"}</Button>
                <div style={{ fontSize: ".7em" }}>Showing {imageApi.images.length.toLocaleString()} of {imageApi.count.toLocaleString()} images</div>
            </div>
        </>}
        <AdvSearchModal onClose={() => setAdvSearchOpen(false)} open={advSearchOpen} />
    </>


}