import { objectToQueryString } from "../components/shared/Utils";
import { Progress } from "../model/Automatic1111/Progress";
import { FilterOptions } from "../model/FilterOptions";
import { GeneratedImage } from "../model/GeneratedImage";
import { HiResRequest } from "../model/HiResRequest";
import { Prompt } from "../model/Prompt";
import { API_PREFIX, Delete, Get, Post, Put, Upload } from "./Common";

const ENDPOINT = API_PREFIX + "images/"

export const imageUrl = (id: number, hiResAvailable?: boolean) => ENDPOINT + `${id}/image` + (hiResAvailable ? "/HiRes" : "")

//#region 
export const uploadExistingImage = (
    setLoading: (value: boolean) => void,
    setProgress: (value: number) => void,
    onSuccess: (val?: GeneratedImage) => void,
    onError: (value: any) => void,
    file: File,
) => Upload(setLoading, setProgress, onSuccess, onError, "POST", ENDPOINT, file)

export const enqueuePrompt = (
    setLoading: (value: boolean) => void,
    setItem: (val?: { jobId: string }) => void,
    onError: (value: any) => void,
    val: Prompt
) => Post(setLoading, setItem, onError, ENDPOINT + "generate", val)

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
) => Post(setLoading, setItem, onError, ENDPOINT + "generateMany", val)

export const getQueue = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Prompt[]) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT + "queue");

export const getCurrentJob = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Prompt) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT + "current");

export const cancelJob = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Prompt[]) => void,
    onError: (value: any) => void,
    id: number
) => Get(setLoading, setItem, onError, ENDPOINT + "cancel/" + id);

export const getProgress = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Progress) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT + "progress");

export const interruptGeneration = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Progress) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT + "interrupt");

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

export const favImage = (
    setLoading: (value: boolean) => void,
    setItem: (value?: GeneratedImage) => void,
    onError: (value: any) => void,
    image: GeneratedImage
) => Put(setLoading, setItem, onError, ENDPOINT, image);

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


