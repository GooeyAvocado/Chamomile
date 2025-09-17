import { createContext, useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { Lora } from "../../model/Lora";
import { getLoras } from "../../api/Loras";

export class LoraContextType {
    public constructor(
        public refresh: () => void,
        public loras: Lora[],
        public loading: boolean,
    ) { }
}

export const LoraContext = createContext<LoraContextType | undefined>(undefined);

export const LoraProvider = (props: { children: any }) => {

    const lorasApi = useApi(getLoras, true);
    const refresh = () => { lorasApi.fetch() }

    const [loras, setLoras] = useState<Lora[]>([])

    useEffect(() => {
        if (lorasApi.data) setLoras(lorasApi.data)
    }, [lorasApi.data])

    return <LoraContext.Provider value={{ loading: lorasApi.loading, loras: loras, refresh: refresh }}>
        {props.children}
    </LoraContext.Provider>

}