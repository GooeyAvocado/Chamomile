//export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:7890"
//export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:7880"
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5109"
//export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "https://localhost:7173"
export const API_PREFIX = `${BACKEND_URL}/api/`

class ApiResponse {
    constructor(
        public data: any,
        public ok: boolean,
        public status: number
    ) { }
}

const CONTENT_TYPE_HEADER = "Content-Type"

const MIME_TYPES = {
    JSON: "application/json",
    TEXT: "text/plain",
    OCTET_STREAM: "application/octet-stream"
}

export function ExternalGet<T>(setLoading: (value: boolean) => void, setItem: (value?: T) => void, onError: (value?: any) => void, url: string) {
    externalFetch(setLoading, setItem, onError, url, "GET");
}

export function Get<T>(setLoading: (value: boolean) => void, setItem: (value?: T) => void, onError: (value?: any) => void, url: string) {
    internalFetch(setLoading, setItem, onError, url, "GET");
}

export function Post<T>(setLoading: (value: boolean) => void, setItem: (value?: T) => void, onError: (value?: any) => void, url: string, body?: any) {
    internalFetch(setLoading, setItem, onError, url, "POST", body);
}

export function Put<T>(setLoading: (value: boolean) => void, setItem: (value?: T) => void, onError: (value?: any) => void, url: string, body?: any) {
    internalFetch(setLoading, setItem, onError, url, "PUT", body);
}

export function Delete<T>(setLoading: (value: boolean) => void, setItem: (value?: T) => void, onError: (value?: any) => void, url: string, body?: any) {
    internalFetch(setLoading, setItem, onError, url, "DELETE", body);
}

export function Upload<T>(
    setLoading: (value: boolean) => void,
    setProgress: (value: number) => void,
    setItem: (val?: T) => void,
    onError: (val?: any) => void,
    method: 'POST' | 'PUT',
    url: string,
    selectedFile?: File,
    additionalData?: any
) {

    if (!selectedFile) {
        onError(new Error("File not selected"))
        return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('FileName', selectedFile.name);
    formData.append('FileType', selectedFile.type);
    if (additionalData) { Object.keys(additionalData).forEach(key => formData.append(key, additionalData[key])) }

    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);

    // Track the progress of the upload
    xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setProgress(percentComplete); // Update progress state
        }
    };

    xhr.onload = () => {
        const response = handleXhrResponse(xhr);
        handleData(response, onError, setLoading, setItem);
    };

    xhr.onerror = (error) => {
        onError({ ...error, status: 999 })
        console.error(error)
        setLoading(false)
    };


    setProgress(0);
    setLoading(true)
    xhr.send(formData);

}


function externalFetch<T>(setLoading: (value: boolean) => void, setItem: (value?: T) => void, onError: (value?: any) => void, url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any) {
    setLoading(true)

    const init = { method: method } as RequestInit;

    if (body) {
        init.body = typeof (body) === 'string' ? body : JSON.stringify(body)
        init.headers = { [CONTENT_TYPE_HEADER]: MIME_TYPES.JSON };
    }

    fetch(url, init)
        .then(handleResponse)
        .then((data: ApiResponse) => handleData(data, onError, setLoading, setItem))
        .catch((e: Error) => handleError(new ApiResponse(undefined, false, 999), onError, e, setLoading));
}

function internalFetch<T>(setLoading: (value: boolean) => void, setItem: (value?: T) => void, onError: (value?: any) => void, url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any) {
    setLoading(true)

    const init = {
        method: method,
        //credentials: 'include'
    } as RequestInit;

    if (body) {
        init.body = typeof (body) === 'string' ? body : JSON.stringify(body)
        init.headers = { [CONTENT_TYPE_HEADER]: MIME_TYPES.JSON };
    }

    fetch(url, init)
        .then(handleResponse)
        .then((data: ApiResponse) => handleData(data, onError, setLoading, setItem))
        .catch((e: Error) => handleError(new ApiResponse(undefined, false, 999), onError, e, setLoading));
}

function handleData<T>(response: ApiResponse, onError: (value?: any) => void, setLoading: (value: boolean) => void, setItem: (value: T) => void) {
    if (!response.ok) {
        handleError(response, onError, response.data ?? new Error(`Api Responded with ${response.status}`), setLoading)
    } else {
        setItem(response.data as T);
    }
    setLoading(false)
}

function handleError(response: ApiResponse, onError: (value?: any) => void, error: any, setLoading: (val: boolean) => void) {
    onError({ ...error, status: response.status })
    console.error(error)
    setLoading(false)
}

const xhrOk = (xhr: XMLHttpRequest) => xhr.status >= 200 && xhr.status < 300;

function handleXhrResponse<T>(request: XMLHttpRequest) {
    const contentType = request.responseType

    if (contentType === 'blob') {
        return new ApiResponse(request.response, xhrOk(request), request.status)
    }

    const text = request.responseText;

    try {
        return new ApiResponse(JSON.parse(text) as T, xhrOk(request), request.status)
    } catch {
        return new ApiResponse(text, xhrOk(request), request.status)
    }
}

async function handleResponse<T>(response: Response): Promise<ApiResponse> {
    const contentType = response.headers.get(CONTENT_TYPE_HEADER)

    if (contentType === MIME_TYPES.OCTET_STREAM) {
        return new ApiResponse(await response.blob(), response.ok, response.status)
    }

    const text = await response.text();
    try {
        return new ApiResponse(JSON.parse(text) as T, response.ok, response.status)
    } catch {
        return new ApiResponse(text, response.ok, response.status)
    }

}