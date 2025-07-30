import { createContext, useMemo, useState } from "react";
import { Prompt } from "../../model/Prompt";
import useApi from "../hooks/useApi";
import { cancelJob, changeStatus, clearQueue, getProgress, getStatus } from "../../api/Images";
import ImageWorkerStatus from "../../model/ImageWorkerStatus";
import { useSnackbar } from "notistack";
import usePolling from "../hooks/usePolling";
import useSignalR from "../hooks/useSignalR";
import { usePingPong } from "../hooks/usePingPong";
import { Progress } from "../../model/Automatic1111/Progress";
import { GeneratedImage } from "../../model/GeneratedImage";

export interface QueueContextType {
    nextModel: string
    queue: Prompt[],
    groupedQueue: Prompt[][],
    activeJob: Prompt,
    progress?: Progress
    paused: boolean,
    lastSuccessfulImage: GeneratedImage,
    sessionImages: number,
    batchImages: number
    batchTotalImages: number
    clearQueue: () => void,
    togglePause: () => void,
    cancel: (jobId: number) => void
}

export const QueueContext = createContext<QueueContextType | undefined>(undefined);

export default function QueueProvider(props: { children: any }) {
    const { refreshPing } = usePingPong();

    const [queue, setQueue] = useState([] as Prompt[])
    const [paused, setPaused] = useState(false)
    const [currentProgress, setCurrentProgress] = useState(undefined as undefined | Progress)
    const [activeJob, setActiveJob] = useState(undefined as undefined | Prompt)
    const [lastSuccessfulImage, setLastSuccessfulImage] = useState(undefined as undefined | GeneratedImage)
    const [modelSequenceChangeBusy, setModelSequenceChangeBusy] = useState<string | undefined>()

    const [sessionImages, setSesionImages] = useState(0)
    const [batchTotalImages, setBatchTotalImages] = useState(0)

    const cancelApi = useApi(cancelJob)
    const clearApi = useApi(clearQueue)
    const changeStatusApi = useApi(changeStatus)

    useApi(getStatus, true, (val?: ImageWorkerStatus) => {
        setQueue(val?.queue ?? [])
        setBatchTotalImages(val?.queue.length ?? 0)
        setActiveJob(val?.currentJob)
        setPaused(!!val?.paused)
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
        //Push the last remaining group
        groups.push(currentGroup)
        return groups;
    }, [queue])

    usePolling(() => {
        getProgressApi.fetch((val) => {
            setCurrentProgress(val)
        })
    }, 2000, !!activeJob)

    useSignalR("QueueUpdated", (data: Prompt[]) => {
        const queueLength = queue.length //I know we don't need to do this but I'm too afraid to not do this. 
        setQueue(data)
        if (data.length === 0) { setBatchTotalImages(0) }
        if (data.length > queueLength) {
            console.warn("More images added")
            //We've added to our queue instead of removing or canceling
            setBatchTotalImages(data.length - queueLength)
        }
    });

    const batchImages = batchTotalImages - queue.length

    useSignalR("JobStarted", (jobId: number, prompt: Prompt, queue: Prompt[]) => {
        console.log("Generation started for job " + jobId)

        setQueue(queue)
        setActiveJob(prompt)
    });

    useSignalR("JobCompleted", (jobId: number, prompt: Prompt, queue: Prompt[], image: GeneratedImage) => {
        console.log("Generation finished for job " + jobId, prompt)
        enqueueSnackbar("Image brewed!", { variant: 'success' })

        setQueue(queue)
        setActiveJob(undefined)
        setCurrentProgress(undefined)
        setLastSuccessfulImage(image);
        setSesionImages((prev) => prev + 1);
    });

    useSignalR("JobFailed", (jobId: number, prompt: Prompt, queue: Prompt[], message: string) => {
        console.error(`Job ${jobId} has failed`)
        console.error(prompt)
        console.error(message)

        enqueueSnackbar("An image has failed to brew: " + message, { variant: 'error' })

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
        enqueueSnackbar("Model changed!", { variant: 'success' })
        setModelSequenceChangeBusy(undefined)
    });

    useSignalR("SDAvailabilityChange", refreshPing);

    useSignalR("GenPause", () => {
        setPaused(true)
    });

    useSignalR("GenResume", () => {
        setPaused(false)
    });

    const context = {
        nextModel: modelSequenceChangeBusy?.replace(".safetensors", ""),
        queue: queue,
        groupedQueue: groupedQueue,
        activeJob: activeJob,
        progress: activeJob ? currentProgress : undefined,
        lastSuccessfulImage: lastSuccessfulImage,
        paused: paused,
        clearQueue: clearApi.fetch,
        togglePause: () => {
            changeStatusApi.fetch(undefined, undefined, { paused: !paused })
        },
        cancel: (jobId: number) => {
            cancelApi.fetch(() => {
                enqueueSnackbar("Order cancelled", { variant: 'info' })
            }, () => {
                enqueueSnackbar("Order could not be cancelled", { variant: 'error' })
            }, jobId)
        },
        batchImages: batchImages,
        batchTotalImages: batchTotalImages,
        sessionImages: sessionImages

    } as QueueContextType


    return <QueueContext.Provider value={context}>
        {props.children}
    </QueueContext.Provider>
}
