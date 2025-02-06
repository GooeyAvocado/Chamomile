import { useEffect } from "react"
import { getImage } from "../../../api/Images"
import useApi from "../../hooks/useApi"
import ImageModal from "./ImageModal"

export default function ImageModalFromId(props: {
    image?: number,
    open: boolean,
    setOpen: (val: boolean) => void
}) {

    const {open,setOpen,image} = props

    const imageApi = useApi(getImage)
    useEffect(()=>{
        if(!open) return; //If we're not even being asked to show it, we don't bother the backend
        if(image===undefined || image<0) return; //If we don't have an image don't bother the backend
        if(imageApi?.data?.id===image) return; //If we already have this image don't bother the backend
        imageApi.fetch(undefined,undefined,image)
    },[image,open])

    if(!imageApi.data) return <></>
    return <ImageModal open={open} setOpen={setOpen} image={imageApi.data}/>

}