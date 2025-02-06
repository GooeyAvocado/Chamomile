import { useEffect, useState } from 'react'

//I should've designed this ages ago

export class Upload<T,U> {
    public constructor(
        /** Indicates whether or not the API is loading */
        public loading: boolean,

        public lastSuccess : T,

        /** Progress (0-100)*/
        public overallProgress: number,

        public uploadIndex:number,

        /** Progress (0-100)*/
        public progress: number,

        public currentUpload : U,

        /** Tell Fido to Fetch */
        public upload: (

            collection : U[],

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
            
        ) => void
    ) { }
}

export default function useCollectionUpload<T,U>(

    /**API function to use */
    uploadFunc: (
        setLoading: (value: boolean) => void,
        setProgress: (value: number) => void,
        onSuccess: () => void,
        onError: (value: any) => void,
        ...args: any
    ) => void,


) {

    const [loading, setLoading] = useState(false)
    const [collection, setCollection] = useState([] as U[])
    const [uploadIndex, setUploadIndex] = useState(-1)
    const [lastSuccess, setLastSuccess] = useState(undefined as T|undefined)
    const [progress, setProgress] = useState(0)

    const defaultOnSuccess = (val:T)=>{};
    const [onSuccess, setOnSuccess] = useState(defaultOnSuccess as any)

    const defaultOnError = (val:any)=>{}
    const [onError, setOnError] = useState(defaultOnError as any)

    useEffect(()=>{
        if(collection.length===0) return;
        setUploadIndex(0)
    }, [collection])

    useEffect(()=>{
        if(uploadIndex<0) return;
        if(uploadIndex>=collection.length) {
            setUploadIndex(-1)
            return;
        };
        setProgress(0)
        uploadFunc(setLoading, setProgress,
            (val?: T) => {
                onSuccess?.(val)
                setLastSuccess(val)
                setUploadIndex(uploadIndex+1)
            }
            ,
            (val: any) => {
                if (val !== undefined) {
                    console.error(val)
                    onError?.(val)
                    setUploadIndex(uploadIndex+1)
                }
            },
            collection[uploadIndex]
        )
    },[uploadIndex])

    const f = (
        collection: U[],
        onSuccess: (val:T)=>void,
        onError: (val:any)=>void
    ) => {
        setOnSuccess(onSuccess)
        setOnError(onError)
        setCollection(collection)
    }


    return { loading, progress, upload: f, overallProgress: uploadIndex*100/collection.length, currentUpload: uploadIndex===-1 ? undefined : collection[uploadIndex],uploadIndex:uploadIndex, lastSuccess: lastSuccess  } as Upload<T,U>;

}