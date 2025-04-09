import { useState } from "react"
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
import { Accordion, AccordionDetails, AccordionSummary, Card, CircularProgress } from "@mui/material"
import { ExpandMore } from "@mui/icons-material"

export default function DisplayPage() {

    const MAX_BUFFER_SIZE = 16

    const [selectedImage, setSelectedImage] = useState(undefined as GeneratedImage | undefined)
    const [images, setImages] = useState([] as GeneratedImage[])
    const [deleteAys, setDeleteAys] = useState(false)
    const selectedIndex = () => images.findIndex((val) => val.id === selectedImage?.id)


    const delApi = useApi(deleteImage);
    const favApi = useApi(favImage)

    const { enqueueSnackbar } = useSnackbar();

    const { progress, queue,activeJob } = useQueue((val) => {
        setSelectedImage(val)
        setImages((prev) => {
            return [val, ...prev].slice(0, MAX_BUFFER_SIZE)
        })
    })

    const onLeft = () => {
        const index = selectedIndex();
        if (index === 0) return;
        setSelectedImage(images[index - 1]);
    }

    const onRight = () => {
        const index = selectedIndex();
        if (index === images.length - 1) return; //If this is the last image do nothing
        setSelectedImage(images[index + 1]);
    }

    const onDelete = () => {
        setDeleteAys(false)
        delApi.fetch(() => {
            enqueueSnackbar("Image deleted!", { variant: 'success' })
            if (selectedImage) {
                if (images.length <= 1) { //If there's one or less images then we need to close
                    setSelectedImage(undefined)
                } else if (selectedIndex() >= images.length - 1) {
                    onLeft()
                } else {
                    onRight();
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
        setSelectedImage(val);
    }

    return <>
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth:'256px', margin:"0 auto" }}>
            <img src="ChamomileWordsPrerendered.png" style={{ width: '256px' }} />
            {activeJob && <div style={{width:'192px'}}><BrewingImageTile imageSrc={(progress?.current_image?.length ?? 0)=== 0 ? "" : "data:image/png;base64," + progress?.current_image} eta={progress?.eta_relative} progress={(progress?.progress ?? 0) * 100}/></div>}
            <div style={{marginTop:'10px'}}><b>Display Mode</b></div>
            <hr style={{width:"256px"}}/>
            <div style={{fontSize:'.8em'}}>Start rendering images on another window and they will appear here</div>
        </div>
        <ImageModal
            open={!!selectedImage} setOpen={() => { }}
            image={selectedImage}
            onDelete={() => setDeleteAys(true)} onDeleteForce={onDelete}
            onLeft={onLeft} onRight={onRight}
            onFavorite={onFavorite} onUpscale={onUpscale} collapseDefault
            imageChildren={(collapse)=>{return <BrewingImageHUD progress={progress} queue={queue} activeJob={activeJob} collapsed={collapse}/>}}
        />
        <AreYouSureModal open={deleteAys} setOpen={setDeleteAys} title="Delete this image?" onYes={onDelete} loading={delApi.loading}>
            Are you sure you want to delete this image?
        </AreYouSureModal>
    </>
}

function BrewingImageHUD(props:{
    queue: Prompt[]
    progress: Progress | undefined
    activeJob?: Prompt,
    collapsed?: boolean
}){

    const {progress,queue,activeJob,collapsed} = props

    return <div style={{position:'absolute', left:"20px", top:'20px', zIndex:'1', opacity:collapsed ? 1 : 0, transition:'opacity 0.2s ease-in-out'}}>
         <Accordion expanded={activeJob !== undefined} >
        <AccordionSummary expandIcon={ activeJob ? <ExpandMore /> : <></>}>
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                {activeJob && <CircularProgress size={16} variant={progress ? "determinate" : "indeterminate"} value={(progress?.progress ?? 0) * 100}/>}
                <div>{queue.length > 0 ? `Brewing ${queue.length + 1} images` : activeJob ? 'Brewing an image': 'Ready' }</div>
            </div>
        </AccordionSummary>
        <AccordionDetails>
        <div style={{width:'192px', marginTop:"-10px"}}>
            <BrewingImageTile imageSrc={(progress?.current_image?.length ?? 0)=== 0 ? "" : "data:image/png;base64," + progress?.current_image} eta={progress?.eta_relative} progress={(progress?.progress ?? 0) * 100}/>
        </div>
        </AccordionDetails>
      </Accordion>
    </div>
}