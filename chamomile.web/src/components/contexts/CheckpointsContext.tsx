import { createContext, useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { getCheckpoints, refreshCheckpoints } from "../../api/Checkpoint";
import { Model } from "../../model/Model";

export class CheckpointContextType {
    public constructor(
        public refresh: (hard?: boolean) => void,
        public checkpoints: Model[],
        public loading: boolean,
    ) { }
}

export const CheckpointContext = createContext<CheckpointContextType | undefined>(undefined);

export const CheckpointProvider = (props: { children: any }) => {

    const modelsApi = useApi(getCheckpoints, true);
    const hardRefreshApi = useApi(refreshCheckpoints);
    const [checkpoints, setCheckpoints] = useState<Model[]>([])

    const refresh = (hard?: boolean) => {
        if (hard) {
            hardRefreshApi.fetch((data) => { if (data) setCheckpoints(data ?? []) })
        } else {
            modelsApi.fetch()
        }
    }

    useEffect(() => {
        if (modelsApi.data) setCheckpoints(modelsApi.data)
    }, [modelsApi.data])

    return <CheckpointContext.Provider value={{ loading: modelsApi.loading || hardRefreshApi.loading, checkpoints, refresh }}>
        {props.children}
    </CheckpointContext.Provider>

}