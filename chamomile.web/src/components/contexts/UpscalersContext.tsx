import { createContext, useState } from "react";
import useApi from "../hooks/useApi";
import { getUpscalers } from "../../api/Checkpoint";

export class UpscalersContextType {
    public constructor(
        public refresh: () => void,
        public upscalers: string[],
        public loading: boolean,
        public selectedUpscaler: string,
        public setSelectedUpscaler: (val: string) => void,
        public upscaleScale: number,
        public setUpscaleScale: (val: number) => void
    ) { }
}

export const UpscalersContext = createContext<UpscalersContextType | undefined>(undefined);

export const UpscalersProvider = (props: { children: any }) => {

    const upscalersApi = useApi(getUpscalers, true, (val) => { if (selectedUpscaler.length === 0) setSelectedUpscaler(val?.upscalers[0] ?? "") });
    const refresh = () => { upscalersApi.fetch() }

    const [selectedUpscaler, setSelectedUpscaler] = useState("");
    const [upscaleScale, setUpscaleScale] = useState(4);

    return <UpscalersContext.Provider value={{
        loading: upscalersApi.loading, upscalers: upscalersApi.data?.upscalers ?? [], refresh: refresh,
        selectedUpscaler: selectedUpscaler, setSelectedUpscaler: setSelectedUpscaler,
        upscaleScale: upscaleScale, setUpscaleScale: setUpscaleScale
    }}>
        {props.children}
    </UpscalersContext.Provider>

}