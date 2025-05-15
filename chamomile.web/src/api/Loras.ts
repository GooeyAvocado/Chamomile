import { objectToQueryString } from "../components/shared/Utils";
import { FilterOptions } from "../model/FilterOptions";
import { Lora } from "../model/Lora";
import Usage from "../model/Usage";
import { API_PREFIX, Get, Put } from "./Common";

const ENDPOINT = API_PREFIX + "loras/"

export const getLoras = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Lora[]) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT)

export const refreshLoras = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Lora[]) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT + "refresh")

export const updateLora = (
    setLoading: (value: boolean) => void,
    onSuccess: () => void,
    onError: (value: any) => void,
    val: Lora
) => Put(setLoading, onSuccess, onError, ENDPOINT, val)

export const getLoraUsage = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Usage[]) => void,
    onError: (value: any) => void,
    filter: FilterOptions
) => Get(setLoading, setItem, onError, ENDPOINT + "usage" + objectToQueryString(filter) );
