import { objectToQueryString } from "../components/shared/Utils";
import { Progress } from "../model/Automatic1111/Progress";
import { FilterOptions } from "../model/FilterOptions";
import GeneralStatistics from "../model/GeneralStatistics";
import { GeneratedImage } from "../model/GeneratedImage";
import { HiResRequest } from "../model/HiResRequest";
import ImageWorkerStatus from "../model/ImageWorkerStatus";
import { KeywordFilterOptions } from "../model/KeywordFilterOptions";
import KeywordUsage from "../model/KeywordUsage";
import KeywordUsageDatedResult from "../model/KeywordUsageDatedResult";
import CheckpointSequence from "../model/CheckpointSequence";
import { Prompt } from "../model/Prompt";
import { API_PREFIX, Delete, Get, Post, Put, Upload } from "./Common";
import GenerateGridRequest from "../model/GenerateGridRequest";

const ENDPOINT = API_PREFIX + "images/"

export const imageUrl = (id?: number, hiResAvailable?: boolean) => !id || id === 0 ? "/color.png" : ENDPOINT + `${id}/image` + (hiResAvailable ? "/HiRes" : "")

//#region 
export const uploadExistingImage = (
    setLoading: (value: boolean) => void,
    setProgress: (value: number) => void,
    onSuccess: (val?: GeneratedImage) => void,
    onError: (value: any) => void,
    file: File,
    queryObj: any
) => Upload(setLoading, setProgress, onSuccess, onError, "POST", ENDPOINT + objectToQueryString(queryObj), file)

export const enqueueGrid = (
    setLoading: (value: boolean) => void,
    setItem: (val?: { jobIds: number[] }) => void,
    onError: (value: any) => void,
    val: GenerateGridRequest
) => Post(setLoading, setItem, onError, ENDPOINT + "generateGrid", val)

export const previewPrompt = (
    setLoading: (value: boolean) => void,
    setItem: (val?: { data: string, metadata: GeneratedImage }) => void,
    onError: (value: any) => void,
    val: Prompt
) => Post(setLoading, setItem, onError, ENDPOINT + "preview", val)

export const enqueuePrompts = (
    setLoading: (value: boolean) => void,
    setItem: (val?: { jobIds: number[] }) => void,
    onError: (value: any) => void,
    val: Prompt[]
) => Post(setLoading, setItem, onError, ENDPOINT + "generate", val)

export const enqueueHighPriorityPrompts = (
    setLoading: (value: boolean) => void,
    setItem: (val?: { jobIds: number[] }) => void,
    onError: (value: any) => void,
    val: Prompt[]
) => Post(setLoading, setItem, onError, ENDPOINT + "generateNow", val)

export const moveJobsToFront = (
    setLoading: (value: boolean) => void,
    setItem: (val?: { jobIds: number[] }) => void,
    onError: (value: any) => void,
    ids: number[]
) => Post(setLoading, setItem, onError, ENDPOINT + "moveToFront", ids);

export const moveJobsToBack = (
    setLoading: (value: boolean) => void,
    setItem: (val?: { jobIds: number[] }) => void,
    onError: (value: any) => void,
    ids: number[]
) => Post(setLoading, setItem, onError, ENDPOINT + "moveToBack", ids);

export const getStatus = (
    setLoading: (value: boolean) => void,
    setItem: (value?: ImageWorkerStatus) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT + "status");

export const changeStatus = (
    setLoading: (value: boolean) => void,
    setItem: (value?: ImageWorkerStatus) => void,
    onError: (value: any) => void,
    body: ImageWorkerStatus
) => Post(setLoading, setItem, onError, ENDPOINT + "status", body);

export const cancelJobs = (
    setLoading: (value: boolean) => void,
    onOk: () => void,
    onError: (value: any) => void,
    ids: number[]
) => Post(setLoading, onOk, onError, ENDPOINT + "cancel", ids);

export const clearQueue = (
    setLoading: (value: boolean) => void,
    onSuccess: () => void,
    onError: (value: any) => void
) => Get(setLoading, onSuccess, onError, ENDPOINT + "cancel");

export const getProgress = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Progress) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT + "progress");

export const interruptGeneration = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Progress) => void,
    onError: (value: any) => void,
    id: number
) => Get(setLoading, setItem, onError, ENDPOINT + `interrupt/${id}`);

export const getImages = (
    setLoading: (value: boolean) => void,
    setItem: (value?: GeneratedImage[]) => void,
    onError: (value: any) => void,
    filter: FilterOptions
) => Get(setLoading, setItem, onError, ENDPOINT + objectToQueryString(filter));

export const getImageCount = (
    setLoading: (value: boolean) => void,
    setItem: (value?: { count: number }) => void,
    onError: (value: any) => void,
    filter: FilterOptions
) => Get(setLoading, setItem, onError, ENDPOINT + "count" + objectToQueryString(filter));

export const getImage = (
    setLoading: (value: boolean) => void,
    setItem: (value?: GeneratedImage) => void,
    onError: (value: any) => void,
    id: number
) => Get(setLoading, setItem, onError, ENDPOINT + id);

export const getRandomImage = (
    setLoading: (value: boolean) => void,
    setItem: (value?: GeneratedImage) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT + "random");

export const favImage = (
    setLoading: (value: boolean) => void,
    setItem: (value?: GeneratedImage) => void,
    onError: (value: any) => void,
    image: GeneratedImage
) => Put(setLoading, setItem, onError, ENDPOINT, image);

export const noteImage = (
    setLoading: (value: boolean) => void,
    setItem: (value?: GeneratedImage) => void,
    onError: (value: any) => void,
    image: GeneratedImage
) => Put(setLoading, setItem, onError, ENDPOINT + "notes", image);

export const hiResImage = (
    setLoading: (value: boolean) => void,
    setItem: (value?: GeneratedImage) => void,
    onError: (value: any) => void,
    request: HiResRequest
) => Post(setLoading, setItem, onError, ENDPOINT + "hiRes", request);


export const deleteImage = (
    setLoading: (value: boolean) => void,
    onSuccess: () => void,
    onError: (value: any) => void,
    id: number,
) => Delete(setLoading, onSuccess, onError, ENDPOINT + id)

export const deleteMultiImage = (
    setLoading: (value: boolean) => void,
    onSuccess: () => void,
    onError: (value: any) => void,
    ids: number[],
) => Delete(setLoading, onSuccess, onError, ENDPOINT, {
    ids: ids
})

export const getModelSequence = (
    setLoading: (value: boolean) => void,
    setItem: (value?: CheckpointSequence[]) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT + "modelSequence");

export const setModelSequence = (
    setLoading: (value: boolean) => void,
    setItem: (value?: CheckpointSequence) => void,
    onError: (value: any) => void,
    sequence: CheckpointSequence[]
) => Post(setLoading, setItem, onError, ENDPOINT + "modelSequence", sequence);

export const getKeywordUsage = (
    setLoading: (value: boolean) => void,
    setItem: (value?: KeywordUsage[]) => void,
    onError: (value: any) => void,
    filter: FilterOptions
) => Get(setLoading, setItem, onError, ENDPOINT + "keywords/usage" + objectToQueryString(filter));

export const getKeywordUsageDated = (
    setLoading: (value: boolean) => void,
    setItem: (value?: KeywordUsageDatedResult) => void,
    onError: (value: any) => void,
    filter: KeywordFilterOptions
) => Get(setLoading, setItem, onError, ENDPOINT + "keywords/datedusage" + objectToQueryString(filter));

export const getGenStats = (
    setLoading: (value: boolean) => void,
    setItem: (value?: GeneralStatistics) => void,
    onError: (value: any) => void,
    filter: FilterOptions
) => Get(setLoading, setItem, onError, ENDPOINT + "stats" + objectToQueryString(filter));

export const getGenStatsDated = (
    setLoading: (value: boolean) => void,
    setItem: (value?: KeywordUsageDatedResult) => void,
    onError: (value: any) => void,
    filter: KeywordFilterOptions
) => Get(setLoading, setItem, onError, ENDPOINT + "datedstats" + objectToQueryString(filter));