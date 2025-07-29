import { useMemo, useState } from "react";
import { Prompt } from "../../model/Prompt";
import useApi from "./useApi";
import { cancelJob, changeStatus, clearQueue, getProgress, getStatus, interruptGeneration } from "../../api/Images";
import useSignalR from "./useSignalR";
import { GeneratedImage } from "../../model/GeneratedImage";
import { useSnackbar } from "notistack";
import usePolling from "./usePolling";
import { Progress } from "../../model/Automatic1111/Progress";
import { usePingPong } from "./usePingPong";
import ImageWorkerStatus from "../../model/ImageWorkerStatus";


export const useQueue = (onImageDone: (val: GeneratedImage) => void, showSnackbar?: boolean) => {

    const { refreshPing } = usePingPong();

    const [queue, setQueue] = useState([] as Prompt[])
    const [paused, setPaused] = useState(false)
    const [currentProgress, setCurrentProgress] = useState(undefined as undefined | Progress)
    const [activeJob, setActiveJob] = useState(undefined as undefined | Prompt)
    const [lastSuccessfulImage, setLastSuccessfulImage] = useState(undefined as undefined | GeneratedImage)
    const [modelSequenceChangeBusy, setModelSequenceChangeBusy] = useState<string | undefined>()

    const interruptApi = useApi(interruptGeneration)
    const cancelApi = useApi(cancelJob)
    const clearApi = useApi(clearQueue)
    const changeStatusApi = useApi(changeStatus)

    useApi(getStatus, true, (val?: ImageWorkerStatus) => {
        setQueue(val?.queue ?? [])
        setActiveJob(val?.currentJob)
        setPaused(paused)
    })

    const getProgressApi = useApi(getProgress)
    const { enqueueSnackbar } = useSnackbar();

    const groupedQueue = useMemo(() => {
        const groups = [] as Prompt[][];
        let currentGroup = [] as Prompt[]

        queue.forEach((image) => {
            if (currentGroup.length === 0 || currentGroup[0].positivePrompt === image.positivePrompt) {
                currentGroup.push(image);
            } else {
                groups.push([...currentGroup]);
                currentGroup = [image];
            }
        });
        //Push the last remaining grou
        groups.push(currentGroup)
        return groups;

    }, [queue])

    usePolling(() => {
        getProgressApi.fetch((val) => {
            setCurrentProgress(val)
        })
    }, 2000, !!activeJob)

    useSignalR("QueueUpdated", (data: Prompt[]) => {
        setQueue(data)
    });

    useSignalR("JobStarted", (jobId: number, prompt: Prompt, queue: Prompt[]) => {
        console.log("Generation started for job " + jobId)

        setQueue(queue)
        setActiveJob(prompt)
    });

    useSignalR("JobCompleted", (jobId: number, prompt: Prompt, queue: Prompt[], image: GeneratedImage) => {
        console.log("Generation finished for job " + jobId, prompt)
        if (showSnackbar) enqueueSnackbar("Image brewed!", { variant: 'success' })

        setQueue(queue)
        setActiveJob(undefined)
        setCurrentProgress(undefined)
        onImageDone(image)
        setLastSuccessfulImage(image);
    });

    useSignalR("JobFailed", (jobId: number, prompt: Prompt, queue: Prompt[], message: string) => {
        console.error(`Job ${jobId} has failed`)
        console.error(prompt)
        console.error(message)

        if (showSnackbar) enqueueSnackbar("An image has failed to brew: " + message, { variant: 'error' })

        setQueue(queue)
        setCurrentProgress(undefined)
        setActiveJob(undefined)
    });

    useSignalR("ModelRerollStarted", (nextModel: string) => {
        console.log("Changing model " + nextModel)
        setModelSequenceChangeBusy(nextModel)
    });

    useSignalR("ModelRerollComplete", (nextModel: string) => {
        console.log("Model Reroll complete " + nextModel)
        if (showSnackbar) enqueueSnackbar("Model changed!", { variant: 'success' })
        setModelSequenceChangeBusy(undefined)
    });

    useSignalR("SDAvailabilityChange", () => {
        refreshPing();
    });

    useSignalR("GenPause", () => {
        setPaused(true)
        if (showSnackbar) enqueueSnackbar("Brewing paused", { variant: 'info' })
    });

    useSignalR("GenResume", () => {
        setPaused(false)
        if (showSnackbar) enqueueSnackbar("Brewing resumed!", { variant: 'info' })
    });

    return {
        nextModel: modelSequenceChangeBusy?.replace(".safetensors", ""),
        queue: queue,
        groupedQueue: groupedQueue,
        activeJob: activeJob,
        progress: activeJob ? currentProgress : undefined,
        lastSuccessfulImage: lastSuccessfulImage,
        paused: paused,
        interrupt: interruptApi.fetch,
        clearQueue: clearApi.fetch,
        togglePause: () => {
            changeStatusApi.fetch(undefined, undefined, { pause: !paused })
        },
        cancel: (jobId: number) => {
            cancelApi.fetch(() => {
                if (showSnackbar) enqueueSnackbar("Order cancelled", { variant: 'info' })
            }, () => {
                if (showSnackbar) enqueueSnackbar("Order could not be cancelled", { variant: 'error' })
            }, jobId)
        },

    }


}