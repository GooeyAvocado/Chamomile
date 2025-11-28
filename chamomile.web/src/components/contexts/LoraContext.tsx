import { createContext, useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { getLoras, refreshLoras } from "../../api/Loras";
import { Model } from "../../model/Model";

export class LoraContextType {
    public constructor(
        public refresh: (hard?: boolean) => void,
        public loras: Model[],
        public loading: boolean,
    ) { }
}

export const LoraContext = createContext<LoraContextType | undefined>(undefined);

export const LoraProvider = (props: { children: any }) => {

    const lorasApi = useApi(getLoras, true);
    const hardRefreshApi = useApi(refreshLoras);
    const [loras, setLoras] = useState<Model[]>([])

    const refresh = (hard?: boolean) => {
        if (hard) {
            hardRefreshApi.fetch((data) => { if (data) setLoras(data ?? []) })
        } else {
            lorasApi.fetch()
        }
    }

    useEffect(() => {
        if (lorasApi.data) setLoras(lorasApi.data)
    }, [lorasApi.data])

    return <LoraContext.Provider value={{ loading: lorasApi.loading || hardRefreshApi.loading, loras, refresh }}>
        {props.children}
    </LoraContext.Provider>

}