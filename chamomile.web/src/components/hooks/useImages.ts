import { useEffect, useState } from "react";
import useApi from "./useApi";
import { FilterOptions } from "../../model/FilterOptions";
import { getImageCount, getImages } from "../../api/Images";
import { GeneratedImage } from "../../model/GeneratedImage";


export const useImages = (filter: FilterOptions | undefined) => {

    const [images, setImages] = useState([] as GeneratedImage[])

    const imagesApi = useApi(getImages)
    const countApi = useApi(getImageCount)

    const refresh = () => {
        if (!filter) return;
        setImages([])
        countApi.fetch(undefined, undefined, filter)
        showMore([]);
    }

    const hasMore = countApi.data ? countApi.data.count > (images?.length ?? 0) : false

    const showMore = (commsOverride?: GeneratedImage[]) => {

        const img = commsOverride ?? images

        imagesApi.fetch((moreComms) => {
            if (moreComms) {
                setImages([...img, ...moreComms])
            }
        }, undefined, { ...filter, lastImage: img.length===0 ? 0 : img.at(-1)?.id } as FilterOptions)

    }

    const reset = () => {
        setImages([])
        imagesApi.resetData();
        countApi.resetData();
    }

    useEffect(refresh, [filter])


    return { images: images, hasMore, showMore: () => showMore(), refresh, loading: imagesApi.loading || countApi.loading, count: countApi.data?.count, reset: reset, 
        appendImage: (val: GeneratedImage) => setImages((prevImages) => [val, ...prevImages]),
        updateImage: (val:GeneratedImage)=> setImages((prevImages) =>[...prevImages].map((a)=>a.id===val.id ? val : a)),
        removeImage: (val:GeneratedImage)=>setImages((prevImages) =>[...prevImages].filter(a=>a.id!==val.id))
    };

}