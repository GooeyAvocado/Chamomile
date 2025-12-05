import { objectToQueryString } from "../components/shared/Utils";
import { FilterOptions } from "../model/FilterOptions";
import { KeywordFilterOptions } from "../model/KeywordFilterOptions";
import KeywordUsage from "../model/KeywordUsage";
import KeywordUsageDatedResult from "../model/KeywordUsageDatedResult";
import { Model } from "../model/Model";
import ModelRefreshResponse from "../model/ModelRefreshResponse";
import { API_PREFIX, Get, Put } from "./Common";

const ENDPOINT = API_PREFIX + "loras/"

export const getLoras = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Model[]) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT)

export const refreshLoras = (
    setLoading: (value: boolean) => void,
    setItem: (value?: ModelRefreshResponse) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT + "refresh")

export const updateLora = (
    setLoading: (value: boolean) => void,
    onSuccess: () => void,
    onError: (value: any) => void,
    val: Model
) => Put(setLoading, onSuccess, onError, ENDPOINT, val)

export const getLoraUsage = (
    setLoading: (value: boolean) => void,
    setItem: (value?: KeywordUsage[]) => void,
    onError: (value: any) => void,
    filter: FilterOptions
) => Get(setLoading, setItem, onError, ENDPOINT + "usage" + objectToQueryString(filter));

export const getLoraUsageDated = (
    setLoading: (value: boolean) => void,
    setItem: (value?: KeywordUsageDatedResult) => void,
    onError: (value: any) => void,
    filter: KeywordFilterOptions
) => Get(setLoading, setItem, onError, ENDPOINT + "datedusage" + objectToQueryString(filter));

export const getLoraTags = (
    setLoading: (value: boolean) => void,
    setItem: (value?: string[]) => void,
    onError: (value: any) => void
) => Get(setLoading, setItem, onError, ENDPOINT + "tags");
