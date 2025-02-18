import { useState } from "react";
import { Prompt } from "../../model/Prompt";
import useApi from "./useApi";
import { cancelJob, getProgress, getQueue, interruptGeneration } from "../../api/Images";
import useSignalR from "./useSignalR";
import { GeneratedImage } from "../../model/GeneratedImage";
import { useSnackbar } from "notistack";
import usePolling from "./usePolling";
import { Progress } from "../../model/Automatic1111/Progress";


export const useQueue = (onImageDone : (val:GeneratedImage)=>void, showSnackbar?: boolean) => {

    const [queue, setQueue] = useState([] as Prompt[])
    const interruptApi = useApi(interruptGeneration)
    const cancelApi = useApi(cancelJob)
    useApi(getQueue, true, (val:Prompt[] | undefined)=>{setQueue(val ?? [])})
    const getProgressApi = useApi(getProgress)
    const [currentProgress, setCurrentProgress] = useState(undefined as undefined|Progress)

    const {enqueueSnackbar} = useSnackbar();

    const [activeJob, setActiveJob] = useState(undefined as undefined | Prompt)
    const [lastSuccessfulImage, setLastSuccessfulImage] = useState(undefined as undefined| GeneratedImage)
    
    usePolling(()=>{
        getProgressApi.fetch((val)=>{
            setCurrentProgress(val)
        })
    },2000,!!activeJob)

    useSignalR("QueueUpdated", (data: Prompt[]) => {
        setQueue(data)
      });
    
    useSignalR("JobStarted", (jobId: number, prompt: Prompt, queue: Prompt[]) => {
        console.log("Generation started for job " + jobId)
        
        setQueue(queue)
        setActiveJob(prompt)
    });
    
    useSignalR("JobCompleted", (jobId:number,prompt:Prompt,queue:Prompt[],image:GeneratedImage) => {
        console.log("Generation finished for job " + jobId, prompt)
        if(showSnackbar) enqueueSnackbar("Image brewed!",{variant:'success'})

        setQueue(queue)
        setActiveJob(undefined)
        setCurrentProgress(undefined)
        onImageDone(image)
        setLastSuccessfulImage(image);
    });

    useSignalR("JobFailed", (jobId: number, prompt: Prompt, queue: Prompt[], message:string) => {
        console.error(`Job ${jobId} has failed`)
        console.error(prompt)
        console.error(message)

        if(showSnackbar) enqueueSnackbar("An image has failed to brew: " + message,{variant:'error'})
        
        setQueue(queue)
        setCurrentProgress(undefined)
        setActiveJob(undefined)
    });


    return { 
        queue: queue, 
        activeJob: activeJob, 
        progress: activeJob ? currentProgress : undefined ,
        lastSuccessfulImage: lastSuccessfulImage,
        interrupt : interruptApi.fetch,
        cancel: (jobId: number) => {cancelApi.fetch(()=>{
            if(showSnackbar) enqueueSnackbar("Order cancelled",{variant:'info'})
        },()=>{
            if(showSnackbar) enqueueSnackbar("Order could not be cancelled",{variant:'error'})
        },jobId)},

    }
    

}