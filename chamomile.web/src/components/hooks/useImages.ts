import { useEffect, useState } from "react";
import useApi from "./useApi";
import { FilterOptions } from "../../model/FilterOptions";
import { getImageCount, getImages } from "../../api/Images";
import { GeneratedImage } from "../../model/GeneratedImage";


export const useImages = (filter: FilterOptions | undefined) => {

    const [images, setImages] = useState([] as GeneratedImage[])
    const [page, setPage] = useState(0)

    const imagesApi = useApi(getImages)
    const countApi = useApi(getImageCount)

    const refresh = () => {
        if (!filter) return;
        setImages([])
        setPage(0);
        countApi.fetch(undefined, undefined, filter)
        showMore(0, []);
    }

    const hasMore = countApi.data ? countApi.data.count !== (images?.length ?? 0) : false

    const showMore = (pageOverride?: number, commsOverride?: GeneratedImage[]) => {

        imagesApi.fetch((moreComms) => {
            if (moreComms) {
                setImages([...(commsOverride ?? images), ...moreComms])
                setPage((pageOverride ?? page) + 1)
            }
        }, undefined, { ...filter, Page: pageOverride ?? page } as FilterOptions)

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