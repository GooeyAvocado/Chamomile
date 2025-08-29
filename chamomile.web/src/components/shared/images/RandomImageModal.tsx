import { useEffect, useState } from "react"
import { deleteImage, favImage, getRandomImage, noteImage } from "../../../api/Images"
import useApi from "../../hooks/useApi"
import ImageModal from "./ImageModal"
import { GeneratedImage } from "../../../model/GeneratedImage"
import { useSnackbar } from "notistack"
import { updateImageAlbums } from "../../../api/Albums"
import { useNavigate } from "react-router-dom"
import { Album } from "../../../model/Album"
import ImageAlbumRequest from "../../../model/ImageAlbumRequest"
import AreYouSureModal from "../modals/AreYouSureModal"
import { Button, Card } from "@mui/material"
import { Casino } from "@mui/icons-material"

export default function RandomImageModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void
}) {

    const { open, setOpen } = props
    const [deleteAys, setDeleteAys] = useState(false)
    const [randomImage, setRandomImage] = useState<GeneratedImage>()

    const delApi = useApi(deleteImage);
    const favApi = useApi(favImage)
    const notesApi = useApi(noteImage)
    const { enqueueSnackbar } = useSnackbar();
    const updateImageAlbumsAPI = useApi(updateImageAlbums)
    const nav = useNavigate();

    const imageApi = useApi(getRandomImage)
    useEffect(() => {
        if (!open) return; //If we're not even being asked to show it, we don't bother the backend
        imageApi.fetch((val) => {
            setRandomImage(val)
        })
    }, [open])

    const onDeleteImage = (override?: GeneratedImage) => {
        setDeleteAys(false)
        delApi.fetch(() => {
            enqueueSnackbar("Image deleted!", { variant: 'success' })
            imageApi.fetch((val) => { if (val) setRandomImage(val) })

        }, () => {
            enqueueSnackbar("Image could not be deleted!", { variant: 'error' })
        }, (override ?? randomImage)?.id)
    }


    const onFavorite = (override?: GeneratedImage) => {
        if (!override && !randomImage) return;
        const img = override ?? randomImage ?? {} as GeneratedImage //This is to cover a condition eslint thinks exists, but really doesn't
        img.favorite = !img?.favorite;
        favApi.fetch((val) => {
            setRandomImage(val ?? override ?? randomImage ?? {} as GeneratedImage)
        }, () => {
            enqueueSnackbar("Image could not be favorited!", { variant: 'error' })
        }, img)
    }

    const onNotesUpdate = (val: string) => {
        if (!randomImage) return;
        const img = randomImage
        img.notes = val;
        notesApi.fetch((val) => {
            setRandomImage(val ?? randomImage)
        }, () => {
            enqueueSnackbar("Notes could not be updated!", { variant: 'error' })
        }, img)
    }

    const onDownload = () => {
        if (!randomImage) return;
        console.log("Updating image count")
        const img = { ...randomImage, downloadCount: (randomImage.downloadCount ?? 0) + 1 } as GeneratedImage;
        setRandomImage(img)
    }

    const onUpscale = (val: GeneratedImage) => {
        setRandomImage(val);
    }

    const onAddAlbum = (val: Album) => {
        updateImageAlbumsAPI.fetch(() => {
            const newImg = {
                ...randomImage,
                albums: [...(randomImage?.albums ?? []), val.id]
            } as GeneratedImage

            setRandomImage(newImg);
            enqueueSnackbar("Added to collection!", { variant: "success" })
        }, () => {
            enqueueSnackbar("Could not add to collection", { variant: "error" })
        }, randomImage?.id, {
            albumId: val.id,
            mode: "ADD"
        } as ImageAlbumRequest)


    }

    const onRemoveAlbum = (val: Album) => {

        updateImageAlbumsAPI.fetch(() => {

            const newImg = {
                ...randomImage,
                albums: [...(randomImage?.albums ?? [])].filter(a => a !== val.id)
            } as GeneratedImage

            setRandomImage(newImg);
            enqueueSnackbar("Removed from collection!", { variant: "success" })
        }, () => {
            enqueueSnackbar("Could not remove from collection", { variant: "error" })
        }, randomImage?.id, {
            albumId: val.id,
            mode: "REMOVE"
        } as ImageAlbumRequest)


    }

    const onViewAlbum = (val: Album) => {
        nav(`/album/${val.id}`)
    }

    if (!randomImage) return <></>

    return <>
        <ImageModal
            open={open} setOpen={setOpen} image={randomImage} onAddAlbum={onAddAlbum} onDelete={() => { setDeleteAys(true) }}
            onDeleteForce={onDeleteImage} onDownload={onDownload} onFavorite={onFavorite} onRemoveAlbum={onRemoveAlbum}
            onUpdateNotes={onNotesUpdate} onUpscale={onUpscale} onViewAlbum={onViewAlbum}
            imageChildren={() => <RandomHUD
                onImFeelingLucky={() => imageApi.fetch((val) => { if (val) setRandomImage(val) })}
            />}
        />

        <AreYouSureModal open={deleteAys} setOpen={setDeleteAys} title="Delete this image?" onYes={onDeleteImage} loading={delApi.loading}>
            Are you sure you want to delete this image?
        </AreYouSureModal>
    </>



}

function RandomHUD({
    onImFeelingLucky
}: {
    onImFeelingLucky: () => void
}) {

    const [hovered, setHovered] = useState(false)

    return <div style={{ position: 'absolute', left: "20px", top: '20px', zIndex: '1' }}>
        <Card style={{ padding: "10px", opacity: hovered ? "1" : "0.2", transition: "opacity 0.2s ease" }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <Button variant="contained" onClick={onImFeelingLucky} startIcon={<Casino />}>Roll again!</Button>
        </Card>
    </div>
}
