import { createContext, useState } from "react";
import useApi from "../hooks/useApi";
import { getUpscalers } from "../../api/Checkpoint";
import { hiResImage } from "../../api/Images";
import { useSnackbar } from "notistack";
import { HiResRequest } from "../../model/HiResRequest";
import { GeneratedImage } from "../../model/GeneratedImage";
import { useSettings } from "../hooks/useSettings";

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
        public onUpscale: (image: GeneratedImage, updateImage?: (val: GeneratedImage) => void) => void,
        public imageUpscalingId?: number
    ) { }
}

export const UpscalersContext = createContext<UpscalersContextType | undefined>(undefined);

export const UpscalersProvider = (props: { children: any }) => {

    const [imageUpscalingId, setImageUpscalingId] = useState<number | undefined>(undefined)
    const upscalersApi = useApi(getUpscalers, true);
    const refresh = () => { upscalersApi.fetch() }

    const { settings, setSettings } = useSettings();

    const selectedUpscaler = settings?.upscaleSettings?.upscaler ?? "None"
    const upscaleScale = settings?.upscaleSettings?.scale ?? 4

    const setSelectedUpscaler = (val: string) => {
        setSettings({
            ...settings, upscaleSettings: {
                scale: upscaleScale,
                upscaler: val
            }
        })
    }

    const setUpscaleScale = (val: number) => {
        setSettings({
            ...settings, upscaleSettings: {
                scale: val,
                upscaler: selectedUpscaler
            }
        })
    }

    const upscaleApi = useApi(hiResImage)
    const { enqueueSnackbar } = useSnackbar();

    const onUpscale = (image: GeneratedImage, updateImage?: (val: GeneratedImage) => void) => {

        if ((selectedUpscaler?.length ?? 0) === 0 || selectedUpscaler?.toLowerCase() === "none") {
            enqueueSnackbar("Select an upscaler first", { variant: 'warning' })
            return;
        };

        setImageUpscalingId(image.id)

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
        selectedUpscaler: selectedUpscaler ?? "", setSelectedUpscaler,
        upscaleScale, setUpscaleScale,
        onUpscale, upscaleLoading: upscaleApi.loading, imageUpscalingId: upscaleApi.loading ? imageUpscalingId : undefined
    }}>
        {props.children}
    </UpscalersContext.Provider>

}