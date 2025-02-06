import { useState } from 'react'

//I should've designed this ages ago

export class Api<T> {
    public constructor(
        /** Indicates whether or not the API is loading */
        public loading: boolean,

        /** Data from the last time the API was fetched. This is cleared after initiating any fetch */
        public data: T,

        /** Error form the last time the API was fetched. This is cleared after initiating any fetch */
        public error: any,

        /**Resets the data back to undefined */
        public resetData: () => void,

        /**Resets the error back to undefined */
        public resetError: () => void,

        /** Tell Fido to Fetch */
        public fetch: (

            /** Callback function that'll occur on success */
            onSuccess?: (
                /** Data retrieved from the API */
                val?: T
            ) => void,

            /** Callback function that'll occur on error */
            onError?: (
                /** Error return from the API */
                val?: any
            ) => void,

            /** Arguments for the API call */
            ...args: any) => void
    ) { }
}

class ApiResponse {
    public constructor(
        public data: any,
        public ok: boolean,
        public status: number
    ) { }
}

class ApiOptions {
    /**
     * Whether or not to maintain the data when fetching
     */
    public maintainData?: boolean = false

    /**
     * Whether or not to maintain the error when fetching
     */
    public maintainError?: boolean = false
}

export default function useApi<T>(

    /**API function to use */
    apiFunc: (
        setLoading: (value: boolean) => void,
        setItem: (value?: T) => void,
        onError: (value?: any) => void,
        ...args: any
    ) => void,

    /** Whether or not to fetch when the component is mounted */
    fetchOnStart?: boolean,

    /** Callback function that'll occur on ONLY fetchOnStart success */
    fetchOnStartOnSuccess?: (
        /** Data retrieved from the API */
        val?: T
    ) => void,

    /** Callback function that'll occur on ONLY fetchOnStart error */
    fetchOnStartOnError?: (
        /** Error return from the API */
        val: any
    ) => void,

    /** Arguments for the fetchOnStart */
    ...fetchOnStartArgs: any

) {
    return useOptionedApi({} as ApiOptions, apiFunc, fetchOnStart, fetchOnStartOnSuccess, fetchOnStartOnError, ...fetchOnStartArgs)
}

export function useOptionedApi<T>(

    options: ApiOptions,

    /**API function to use */
    apiFunc: (
        setLoading: (value: boolean) => void,
        setItem: (value?: T) => void,
        onError: (value?: any) => void,
        ...args: any
    ) => void,

    /** Whether or not to fetch when the component is mounted */
    fetchOnStart?: boolean,

    /** Callback function that'll occur on ONLY fetchOnStart success */
    fetchOnStartOnSuccess?: (
        /** Data retrieved from the API */
        val?: T
    ) => void,

    /** Callback function that'll occur on ONLY fetchOnStart error */
    fetchOnStartOnError?: (
        /** Error return from the API */
        val: any
    ) => void,

    /** Arguments for the fetchOnStart */
    ...fetchOnStartArgs: any

) {

    const [_fetchOnStart, set_fetchOnStart] = useState(fetchOnStart)
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(undefined as any as T)
    const [error, setError] = useState(undefined as any as T)

    const resetData = () => setData(undefined as any as T)
    const resetError = () => setError(undefined as any)

    const fetch = (
        onSuccess?: (val?: T) => void,
        onError?: (val?: any) => void,
        ...args: any
    ) => {
        if (!options.maintainData) { resetData() }
        if (!options.maintainError) { resetError() }

        apiFunc(setLoading,
            onSuccess
                ? (val?: T) => { onSuccess(val); setData(val ?? undefined as any) }
                : (val?: T) => { setData(val ?? undefined as any) },
            onError ? (val: any) => {
                setError(val)
                if (val !== undefined) {
                    console.error(val)
                    onError(val)
                }
            } : setError,
            ...args
        )
    }

    if (_fetchOnStart) {
        set_fetchOnStart(false);
        fetch(fetchOnStartOnSuccess, fetchOnStartOnError, ...fetchOnStartArgs)
    }

    return { loading, data, error, resetData, resetError, fetch } as Api<T>;

}

export function generateSimpleApi<T>(
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: any,
) {

    const init = generateInit(method, body)

    const apiFunc = (
        setLoading: (value: boolean) => void,
        setItem: (value: T) => void,
        onError: (value?: any) => void
    ) => {
        fetch(url, init)
            .then(handleResponse)
            .then((data: ApiResponse) => handleData(data, setLoading, setItem, onError))
            .catch(() => handleError)

    }

    return apiFunc;
}

export function generateApi<T>(
    argsFunc: (...args: any) => { url: string, body?: any },
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
) {

    const apiFunc = (
        setLoading: (value: boolean) => void,
        setItem: (value: T) => void,
        onError: (value?: any) => void,
        ...args: any
    ) => {

        const { url, body } = argsFunc(...args);
        const init = generateInit(method, body)

        fetch(url, init)
            .then(handleResponse)
            .then((data: ApiResponse) => handleData(data, setLoading, setItem, onError))
            .catch(() => handleError)
    }

    return apiFunc;
}

function handleError(
    error: any,
    setLoading: (value: boolean) => void,
    onError: (value?: any) => void
) {
    onError(error);
    setLoading(false);

}

function handleData<T>(
    response: ApiResponse,
    setLoading: (value: boolean) => void,
    setItem: (value: T) => void,
    onError: (value?: any) => void
) {

    if (!response.ok) {
        console.error(response)
        onError(response.data ?? new Error(`API responded with ${response.status}`))
    } else {
        setItem(response.data as T)
    }

    setLoading(false)
}

async function handleResponse<T>(response: Response) {
    try {
        const data = (await response.json()) as T
        return new ApiResponse(data, response.ok, response.status)
    } catch {
        console.error("Could not parse response as JSON!")
        return new ApiResponse(undefined, response.ok, response.status)
    }
}

function generateInit(
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: any
): RequestInit | undefined {
    if (method === "GET") return undefined
    let init = { method: method } as RequestInit
    if (body) {
        init = {
            ...init,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }
    }
}