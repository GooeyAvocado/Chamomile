import { createContext, useState } from "react";
import useApi from "../hooks/useApi";
import { getUpscalers } from "../../api/Checkpoint";
import { hiResImage } from "../../api/Images";
import { useSnackbar } from "notistack";
import { HiResRequest } from "../../model/HiResRequest";
import { GeneratedImage } from "../../model/GeneratedImage";

export class UpscalersContextType {
    public constructor(
        public refresh: () => void,
        public upscalers: string[],
        public loading: boolean,
        public upscaleLoading: boolean,
        public selectedUpscaler: string,
        public setSelectedUpscaler: (val: string) => void,
        public upscaleScale: number,
        public setUpscaleScale: (val: number) => void,
        public onUpscale: (image: GeneratedImage, updateImage?: (val: GeneratedImage) => void) => void
    ) { }
}

export const UpscalersContext = createContext<UpscalersContextType | undefined>(undefined);

export const UpscalersProvider = (props: { children: any }) => {

    const upscalersApi = useApi(getUpscalers, true, (val) => { if (selectedUpscaler.length === 0) setSelectedUpscaler(val?.upscalers[0] ?? "") });
    const refresh = () => { upscalersApi.fetch() }

    const [selectedUpscaler, setSelectedUpscaler] = useState("");
    const [upscaleScale, setUpscaleScale] = useState(4);

    const upscaleApi = useApi(hiResImage)
    const { enqueueSnackbar } = useSnackbar();

    const onUpscale = (image: GeneratedImage, updateImage?: (val: GeneratedImage) => void) => {

        if (selectedUpscaler.length === 0) return;

        upscaleApi.fetch(val => {
            enqueueSnackbar("Image upscaled!", { variant: 'success' })
            if (val) updateImage?.(val);
        }, () => {
            enqueueSnackbar("Image could not be upscaled", { variant: 'error' })
        }, {
            imageID: image?.id,
            resizeFactor: upscaleScale,
            upscaler: selectedUpscaler
        } as HiResRequest);
    }

    return <UpscalersContext.Provider value={{
        loading: upscalersApi.loading, upscalers: upscalersApi.data?.upscalers ?? [], refresh,
        selectedUpscaler, setSelectedUpscaler,
        upscaleScale, setUpscaleScale,
        onUpscale, upscaleLoading: upscaleApi.loading
    }}>
        {props.children}
    </UpscalersContext.Provider>

}