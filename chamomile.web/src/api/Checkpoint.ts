import { objectToQueryString } from "../components/shared/Utils";
import { FilterOptions } from "../model/FilterOptions";
import { KeywordFilterOptions } from "../model/KeywordFilterOptions";
import KeywordUsage from "../model/KeywordUsage";
import KeywordUsageDatedResult from "../model/KeywordUsageDatedResult";
import { CheckpointRequest } from "../model/CheckpointRequest";
import { API_PREFIX, Get, Post, Put } from "./Common";
import { Model } from "../model/Model";

const ENDPOINT = API_PREFIX + "checkpoints/"

export const getCheckpoints = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Model[]) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT)

export const getUpscalers = (
    setLoading: (value: boolean) => void,
    setItem: (value?: { upscalers: string[] }) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT + "upscalers")

export const refreshCheckpoints = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Model[]) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT + "refresh")

export const currentCheckpoint = (
    setLoading: (value: boolean) => void,
    setItem: (value?: CheckpointRequest) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT + "current")

export const setCheckpoint = (
    setLoading: (value: boolean) => void,
    onSuccess: () => void,
    onError: (value: any) => void,
    val: Model
) => Post(setLoading, onSuccess, onError, ENDPOINT + "current", val)

export const updateCheckpoint = (
    setLoading: (value: boolean) => void,
    onSuccess: () => void,
    onError: (value: any) => void,
    val: Model
) => Put(setLoading, onSuccess, onError, ENDPOINT, val)

export const getCheckpointUsage = (
    setLoading: (value: boolean) => void,
    setItem: (value?: KeywordUsage[]) => void,
    onError: (value: any) => void,
    filter: FilterOptions
) => Get(setLoading, setItem, onError, ENDPOINT + "usage" + objectToQueryString(filter));

export const getCheckpointUsageDated = (
    setLoading: (value: boolean) => void,
    setItem: (value?: KeywordUsageDatedResult) => void,
    onError: (value: any) => void,
    filter: KeywordFilterOptions
) => Get(setLoading, setItem, onError, ENDPOINT + "datedusage" + objectToQueryString(filter));

export const getCheckpointTags = (
    setLoading: (value: boolean) => void,
    setItem: (value?: string[]) => void,
    onError: (value: any) => void
) => Get(setLoading, setItem, onError, ENDPOINT + "tags");