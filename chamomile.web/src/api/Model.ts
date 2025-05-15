import { objectToQueryString } from "../components/shared/Utils";
import { FilterOptions } from "../model/FilterOptions";
import { Model } from "../model/Model";
import { ModelRequest } from "../model/ModelRequest";
import Usage from "../model/Usage";
import { API_PREFIX, Get, Post, Put } from "./Common";

const ENDPOINT = API_PREFIX + "models/"

export const getModels = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Model[]) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT)

export const getUpscalers = (
    setLoading: (value: boolean) => void,
    setItem: (value?: {upscalers:string[]}) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT + "upscalers")

export const refreshModels = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Model[]) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT + "refresh")

export const currentModel = (
    setLoading: (value: boolean) => void,
    setItem: (value?: ModelRequest) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT + "current")

export const setModel = (
    setLoading: (value: boolean) => void,
    onSuccess: () => void,
    onError: (value: any) => void,
    val: Model
) => Post(setLoading, onSuccess, onError, ENDPOINT + "current", val)

export const updateModel = (
    setLoading: (value: boolean) => void,
    onSuccess: () => void,
    onError: (value: any) => void,
    val: Model
) => Put(setLoading, onSuccess, onError, ENDPOINT, val)

export const getModelUsage = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Usage[]) => void,
    onError: (value: any) => void,
    filter: FilterOptions
) => Get(setLoading, setItem, onError, ENDPOINT + "usage" + objectToQueryString(filter) );
