import { Grid } from "../model/Grid";
import { API_PREFIX, Delete, Get, Post, Put } from "./Common";

const ENDPOINT = API_PREFIX + "grids/"

export const createGrid = (
    setLoading: (value: boolean) => void,
    setItem: (val?: Grid) => void,
    onError: (value: any) => void,
    val: Grid
) => Post(setLoading, setItem, onError, ENDPOINT, val)

export const getGrids = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Grid[]) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT)

export const getGrid = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Grid) => void,
    onError: (value: any) => void,
    id: number,
) => Get(setLoading, setItem, onError, ENDPOINT + id)

export const updateGrid = (
    setLoading: (value: boolean) => void,
    setItem: (val?: Grid) => void,
    onError: (value: any) => void,
    val: Grid
) => Put(setLoading, setItem, onError, ENDPOINT, val)

export const deleteGrid = (
    setLoading: (value: boolean) => void,
    onSuccess: () => void,
    onError: (value: any) => void,
    id: number,
) => Delete(setLoading, onSuccess, onError, ENDPOINT + id)