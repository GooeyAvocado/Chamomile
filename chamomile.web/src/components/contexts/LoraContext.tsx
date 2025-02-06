import { createContext } from "react";
import useApi from "../hooks/useApi";
import { Lora } from "../../model/Lora";
import { refreshLoras } from "../../api/Loras";

export class LoraContextType {
    public constructor(
        public refresh: () => void,
        public loras: Lora[],
        public loading: boolean,
    ) { }
}

export const LoraContext = createContext<LoraContextType | undefined>(undefined);

export const LoraProvider = (props: { children: any }) => {

    const lorasApi = useApi(refreshLoras, true);
    const refresh = () => {lorasApi.fetch()}

    return <LoraContext.Provider value={{ loading: lorasApi.loading, loras: lorasApi.data, refresh: refresh }}>
        {props.children}
    </LoraContext.Provider>

}