import { createContext, useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { Model } from "../../model/Model";
import { getModels, refreshModels } from "../../api/Model";

export class ModelContextType {
    public constructor(
        public refresh: (hard?: boolean) => void,
        public models: Model[],
        public loading: boolean,
    ) { }
}

export const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider = (props: { children: any }) => {

    const modelsApi = useApi(getModels, true);
    const hardRefreshApi = useApi(refreshModels);
    const [models, setModels] = useState<Model[]>([])

    const refresh = (hard?: boolean) => {
        if (hard) {
            hardRefreshApi.fetch((data) => { if (data) setModels(data ?? []) })
        } else {
            modelsApi.fetch()
        }
    }

    useEffect(() => {
        if (modelsApi.data) setModels(modelsApi.data)
    }, [modelsApi.data])

    return <ModelContext.Provider value={{ loading: modelsApi.loading || hardRefreshApi.loading, models: models, refresh: refresh }}>
        {props.children}
    </ModelContext.Provider>

}