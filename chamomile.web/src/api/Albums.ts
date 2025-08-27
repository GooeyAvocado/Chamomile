import { Album } from "../model/Album"
import AlbumCreateRequest from "../model/AlbumCreateRequest"
import ImageAlbumRequest from "../model/ImageAlbumRequest"
import { API_PREFIX, Delete, Get, Post, Put } from "./Common"

const ENDPOINT = API_PREFIX + "images/"

export const createAlbum = (
    setLoading: (value: boolean) => void,
    setItem: (val?: Album) => void,
    onError: (value: any) => void,
    val: AlbumCreateRequest
) => Post(setLoading, setItem, onError, ENDPOINT + "Albums", val)

export const getAlbums = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Album[]) => void,
    onError: (value: any) => void,
) => Get(setLoading, setItem, onError, ENDPOINT + "Albums")

export const getImageAlbums = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Album[]) => void,
    onError: (value: any) => void,
    image: number
) => Get(setLoading, setItem, onError, ENDPOINT + `${image}/Albums`)


export const updateAlbums = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Album) => void,
    onError: (value: any) => void,
    val: Album
) => Put(setLoading, setItem, onError, ENDPOINT + "Albums", val)

export const updateImageAlbums = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Album[]) => void,
    onError: (value: any) => void,
    image: number,
    val: ImageAlbumRequest
) => Put(setLoading, setItem, onError, ENDPOINT + `${image}/Albums`, val)

export const updateMultiImageAlbums = (
    setLoading: (value: boolean) => void,
    setItem: (value?: Album[]) => void,
    onError: (value: any) => void,
    val: ImageAlbumRequest
) => Put(setLoading, setItem, onError, ENDPOINT + `multi/Albums`, val)

export const deleteAlbum = (
    setLoading: (value: boolean) => void,
    onSuccess: () => void,
    onError: (value: any) => void,
    id: number,
) => Delete(setLoading, onSuccess, onError, ENDPOINT + "Albums/" + id)
