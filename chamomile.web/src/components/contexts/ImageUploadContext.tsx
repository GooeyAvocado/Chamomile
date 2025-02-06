import { createContext, useEffect, useState } from "react";

import { uploadExistingImage } from "../../api/Images";
import useCollectionUpload from "../hooks/useCollectionUpload";
import { GeneratedImage } from "../../model/GeneratedImage";

export class ImageUploadContextType {
    public constructor(
        public files: File[] | undefined,
        public setFiles: (val:File[])=>void,
        public overallProgress: number,
        public progress : number,
        public currentUpload : File,
        public uploadPrompt:boolean,
        public setUploadPrompt: (val:boolean)=>void,
        public upload : (onSuccess : (val?:GeneratedImage|unknown)=>void, onError : (val:any)=>void) => void,
        public uploadIndex:number,
        public lastSuccess: GeneratedImage
    ) { }
}

export const ImageUploadContext = createContext<ImageUploadContextType | undefined>(undefined);

export const ImageUploadProvider = (props: { children: any }) => {

    const fileUploadApi = useCollectionUpload(uploadExistingImage);
    const [collection, setCollection] = useState(undefined as undefined|File[])
    const [uploadPrompt, setUploadPrompt] = useState(false)

    useEffect(()=>{
        if(collection && (collection?.length ?? 0) > 0){
            setUploadPrompt(true)
            fileUploadApi.upload(collection)
        } else {
            setUploadPrompt(false)
        }
        
    },[collection])

    const upload = () => {
        if(collection===undefined) return;
        fileUploadApi.upload(collection)
    }

    

    return <ImageUploadContext.Provider value={{ 
        files: collection, setFiles:setCollection, 
        currentUpload:fileUploadApi.currentUpload, 
        overallProgress: fileUploadApi.overallProgress, 
        progress:fileUploadApi.progress,
        uploadPrompt:uploadPrompt,
        setUploadPrompt:setUploadPrompt,
        upload:upload,
        uploadIndex:fileUploadApi.uploadIndex,
        lastSuccess: fileUploadApi.lastSuccess
    } as ImageUploadContextType}>
        {props.children}
    </ImageUploadContext.Provider>

}