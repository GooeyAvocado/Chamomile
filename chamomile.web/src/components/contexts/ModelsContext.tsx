import { createContext } from "react";
import useApi from "../hooks/useApi";
import { Model } from "../../model/Model";
import { refreshModels } from "../../api/Model";

export class ModelContextType {
    public constructor(
        public refresh: () => void,
        public models: Model[],
        public loading: boolean,
    ) { }
}

export const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider = (props: { children: any }) => {

    const modelsApi = useApi(refreshModels,true);
    const refresh = () => {modelsApi.fetch()}

    return <ModelContext.Provider value={{ loading: modelsApi.loading, models: modelsApi.data, refresh: refresh }}>
        {props.children}
    </ModelContext.Provider>

}