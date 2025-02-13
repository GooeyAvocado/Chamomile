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
import { deleteImage, favImage } from "../../../api/Images";
import AreYouSureModal from "../modals/AreYouSureModal";
import { Button, CircularProgress } from "@mui/material";
import WelcomePane from "../welcome/WelcomePane";
import { useQueue } from "../../hooks/useQueue";
import QueuedImageTile from "./QueuedImageTile";
import PromptEditorModal from "../prompt/PromptEditorModal";
import useUserAgent from "../../hooks/useUserAgent";

export default function ImageViewer(props:{
    filter:FilterOptions
    showBrewing?: boolean,
    showWelcome?:boolean,
    onClick?: (val: GeneratedImage) => void
    showQueueSnackbars? : boolean
}){

    const {filter,showBrewing, onClick, showWelcome, showQueueSnackbars} = props;
    const imageApi = useImages(filter);
    const delApi = useApi(deleteImage);
    const favApi = useApi(favImage)

    const [open, setOpen] = useState(false)
    const [deleteAys, setDeleteAys] = useState(false)
    const [uploadBrewBlob, setUploadBrewBlob] = useState(undefined as string|undefined)
    const [selectedImage, setSelectedImage] = useState(undefined as undefined | GeneratedImage)
    const [interruptOpen,SetInterruptOpen] = useState(false);
    
    const {enqueueSnackbar} = useSnackbar();
    const {isMobile} = useUserAgent();
    const {currentUpload,lastSuccess, progress: uploadProgress} = useImageUpload();

    const {activeJob,cancel,progress,queue} = useQueue((val)=>{
        if(showBrewing){
            //Check if we're on index 0
            if(selectedIndex()===0) setSelectedImage(val)
            imageApi.appendImage(val)
        }
    }, showQueueSnackbars)

    useEffect(()=>{
        imageApi.refresh()
    },[filter])

    useEffect(()=>{
        if(showBrewing && lastSuccess!==undefined && !!lastSuccess?.id){
            imageApi.appendImage(lastSuccess)
        }
    },[lastSuccess])

    useEffect(()=>{
        if(!showBrewing) return;
        if(uploadBrewBlob) URL.revokeObjectURL(uploadBrewBlob)
        if(currentUpload) setUploadBrewBlob(URL.createObjectURL(currentUpload))
    },[currentUpload])

    const onDelete = () => {
        setDeleteAys(false)
        delApi.fetch(()=>{
            enqueueSnackbar("Image deleted!",{variant:'success'})
            if(imageApi.count===0){
                setSelectedImage(undefined)
            } else if( selectedIndex() >= imageApi.count-1 ){
                onLeft()
            } else {
                onRight();
            }
            imageApi.removeImage(selectedImage ?? {} as GeneratedImage)
        },()=>{
            enqueueSnackbar("Image could not be deleted!",{variant:'error'})
        }, selectedImage?.id)
    }

    const onFavorite = () => {
        if(!selectedImage) return;
        selectedImage.favorite = !selectedImage?.favorite;
        favApi.fetch((val)=>{
            imageApi.updateImage(val ?? selectedImage)
        },()=>{
            enqueueSnackbar("Image could not be favorited!",{variant:'error'})
        }, selectedImage)
    }

    const onUpscale = (val:GeneratedImage) => {
        imageApi.updateImage(val ?? selectedImage)
        setSelectedImage(val);
    }

    const selectedIndex = () => {
        return imageApi.images.map(a=>a.id).indexOf(selectedImage?.id ?? 0);
    }

    const onLeft = () => {
        const index = selectedIndex();
        if(index=== 0) return;
        setSelectedImage(imageApi.images[index-1]);
    }

    const onRight = () => {
        const index = selectedIndex();
        if(index=== imageApi.images.length-1) return; //If this is the last image do nothing
        if(index=== imageApi.images.length-2) { //If is the second to last image
            if(imageApi.hasMore) imageApi.showMore();
        };
        setSelectedImage(imageApi.images[index+1]);
    }

    const filterIsEmpty = () => {
        return filter.favorite === false && 
            filter.fromDate?.trim().length===0 &&
            filter.toDate?.trim().length===0 &&
            filter.lora?.trim().length === 0 &&
            filter.model?.trim().length === 0 &&
            filter.query?.trim().length === 0
    }

    useEffect(()=>{SetInterruptOpen(false)},[activeJob])

    return <>
        <div style={{
            display:'grid',
            gridTemplateColumns:`repeat(auto-fit, minmax(${isMobile ? '128' : '192'}px, 1fr))`,
            gap:'20px'
        }}>
            {showBrewing && queue.map(p=><QueuedImageTile prompt={p} onCancel={()=>cancel(p.id)}/>)}
            {showBrewing && activeJob && <>
                <BrewingImageTile imageSrc={(progress?.current_image?.length ?? 0)=== 0 ? "" : "data:image/png;base64," + progress?.current_image} eta={progress?.eta_relative} onClick={()=>{SetInterruptOpen(true)}} progress={(progress?.progress ?? 0) * 100}/>
                <PromptEditorModal onOk={()=>{}} open={interruptOpen} prompt={activeJob} setOpen={SetInterruptOpen} title="Brewing image" preview progress={progress}/>
            </>}
            {showBrewing && currentUpload && <>
                <BrewingImageTile imageSrc={uploadBrewBlob ?? ""} progress={uploadProgress}/>
            </>}
            {imageApi.images?.map(a=> <ImageTile image={a} onClick={onClick ? ()=>{onClick(a)} : ()=>{setSelectedImage(a); setOpen(true)}}/>)}
            {!onClick && <>
                <ImageModal open={open} setOpen={setOpen} image={selectedImage} onDelete={()=>setDeleteAys(true)} onDeleteForce={onDelete} onFavorite={onFavorite} onLeft={onLeft} onRight={onRight} onUpscale={onUpscale}/>
                <AreYouSureModal open={deleteAys} setOpen={setDeleteAys} title="Delete this image?" onYes={onDelete} loading={delApi.loading}>
                    Are you sure you want to delete this image?
                </AreYouSureModal>
            </>}
        </div>
        {imageApi.count===0 && <>
            {filterIsEmpty() && !imageApi.loading && showWelcome ? <WelcomePane/>
            :<div style={{height:'100%', display:"flex" ,flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
                {imageApi.loading ? <>
                    <img src="brewing.gif" style={{width:"128px"}}/>
                    <div style={{marginTop:"-20px"}}>Loading images</div>
                </> : <>
                    <img src="outlinepadded.png" style={{width:"128px"}}/>
                    <div style={{marginTop:"-20px"}}>No images!</div>
                </>}
            </div>}
        </>}
        {imageApi.hasMore && (imageApi.images?.length ?? 0) > 0 && <>
            <div style={{textAlign:'center', marginTop:"20px"}}>
                <Button size="small" onClick={()=>imageApi.showMore()} disabled={imageApi.loading}> {imageApi.loading ? <CircularProgress size={24}/> : "Show More"}</Button>
                <div style={{fontSize:".7em"}}>Showing {imageApi.images.length.toLocaleString()} of {imageApi.count.toLocaleString()} images</div>
            </div>
        </>} 
    </>


}