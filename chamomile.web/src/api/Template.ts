import Template from "../model/Template"
import { API_PREFIX, Delete, Get, Post, Put } from "./Common"

const ENDPOINT = API_PREFIX + "template/"

export const createTemplate = (
    setLoading: (value: boolean) => void,
    setItem: (val?: Template) => void,
    onError: (value: any) => void,
    val: Template
) => Post(setLoading, setItem, onError, ENDPOINT, val)

export const getTemplates = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Template[]) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT)

export const getTemplate = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Template) => void,
    onError: (value: any) => void,
    name: string,
) => Get(setLoading, setItem, onError, ENDPOINT + name)

export const updateTemplate = (
    setLoading: (value: boolean) => void,
    setItem: (val?: Template) => void,
    onError: (value: any) => void,
    val: Template
) => Put(setLoading, setItem, onError, ENDPOINT, val)

export const deleteTemplate = (
    setLoading: (value: boolean) => void,
    onSuccess: () => void,
    onError: (value: any) => void,
    name: string
) => Delete(setLoading, onSuccess, onError, ENDPOINT + name)