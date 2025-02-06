import { API_PREFIX, Get } from "./Common";

const ENDPOINT = API_PREFIX + "ping/"

export const pingPong = (
    setLoading: (value: boolean) => void,
    setItem: (val?: {DB:boolean, SD:boolean}) => void,
    onError: (value: any) => void,
) => {
    Get(setLoading, setItem, onError, ENDPOINT)
}

