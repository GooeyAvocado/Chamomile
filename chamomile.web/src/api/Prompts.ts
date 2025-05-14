import Sampler from "../model/Automatic1111/Sampler";
import Scheduler from "../model/Automatic1111/Scheduler";
import { Prompt } from "../model/Prompt";
import { API_PREFIX, Delete, Get, Post, Put } from "./Common";

const ENDPOINT = API_PREFIX + "prompts/"

export const createPrompt = (
    setLoading: (value: boolean) => void,
    onSuccess: () => void,
    onError: (value: any) => void,
    val: Prompt
) => Post(setLoading, onSuccess, onError, ENDPOINT, val)

export const getPrompts = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Prompt[]) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT)

export const getPrompt = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Prompt) => void,
    onError: (value: any) => void,
    id: number,
) => Get(setLoading, setItem, onError, ENDPOINT + id)

export const updatePrompt = (
    setLoading: (value: boolean) => void,
    onSuccess: () => void,
    onError: (value: any) => void,
    val: Prompt
) => Put(setLoading, onSuccess, onError, ENDPOINT, val)

export const deletePrompt = (
    setLoading: (value: boolean) => void,
    onSuccess: () => void,
    onError: (value: any) => void,
    id: number,
) => Delete(setLoading, onSuccess, onError, ENDPOINT + id)


export const getWildcards = (
    setLoading: (value: boolean) => void,
    setItem: (val:any) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT + "wildcards")

export const getSchedulers = (
    setLoading: (value: boolean) => void,
    setItem: (val?:Scheduler[]) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT + "schedulers")

export const getSamplers = (
    setLoading: (value: boolean) => void,
    setItem: (val?:Sampler[]) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT + "samplers")