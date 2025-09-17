import { createContext, useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { Model } from "../../model/Model";
import { getModels } from "../../api/Model";

export class ModelContextType {
    public constructor(
        public refresh: () => void,
        public models: Model[],
        public loading: boolean,
    ) { }
}

export const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider = (props: { children: any }) => {

    const modelsApi = useApi(getModels, true);
    const refresh = () => { modelsApi.fetch() }

    const [models, setModels] = useState<Model[]>([])

    useEffect(() => {
        if (modelsApi.data) setModels(modelsApi.data)
    }, [modelsApi.data])

    return <ModelContext.Provider value={{ loading: modelsApi.loading, models: models, refresh: refresh }}>
        {props.children}
    </ModelContext.Provider>

}