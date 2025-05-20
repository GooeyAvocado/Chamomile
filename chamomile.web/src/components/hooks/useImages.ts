import { useEffect, useState } from "react";
import useApi from "./useApi";
import { FilterOptions } from "../../model/FilterOptions";
import { getImageCount, getImages } from "../../api/Images";
import { GeneratedImage } from "../../model/GeneratedImage";


export const useImages = (filter: FilterOptions | undefined) => {

    const [images, setImages] = useState([] as GeneratedImage[])
    const [count, setCount] = useState(0)

    const imagesApi = useApi(getImages)
    const countApi = useApi(getImageCount)

    const refresh = () => {
        if (!filter) return;
        setImages([])
        countApi.fetch((data) => setCount(data?.count ?? 0), undefined, filter)
        showMore([]);
    }

    const hasMore = count ? count > (images?.length ?? 0) : false

    const showMore = (commsOverride?: GeneratedImage[]) => {

        const img = commsOverride ?? images

        imagesApi.fetch((moreComms) => {
            if (moreComms) {
                setImages([...img, ...moreComms])
            }
        }, undefined, { ...filter, lastImage: img.length === 0 ? 0 : img.at(-1)?.id } as FilterOptions)

    }

    const reset = () => {
        setImages([])
        imagesApi.resetData();
        countApi.resetData();
    }

    useEffect(refresh, [filter])


    return {
        images: images,
        hasMore,
        showMore: () => showMore(),
        refresh,
        loading: imagesApi.loading || countApi.loading,
        count: count,
        error: imagesApi.error,
        reset: reset,
        appendImage: (val: GeneratedImage) => {
            setImages((prevImages) => [val, ...prevImages])
            setCount((count) => count + 1)
        },
        updateImage: (val: GeneratedImage) => {
            setImages((prevImages) => [...prevImages].map((a) => a.id === val.id ? val : a))
        },
        removeImage: (val: GeneratedImage) => {
            setImages((prevImages) => [...prevImages].filter(a => a.id !== val.id))
            setCount((count) => count - 1)
        }
    };

}