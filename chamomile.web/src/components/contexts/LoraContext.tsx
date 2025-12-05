import { createContext, useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { getLoras, refreshLoras } from "../../api/Loras";
import { Model } from "../../model/Model";
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

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

    const [errorLoras, setErrorLoras] = useState<Model[]>([])
    const [errorLorasOpen, setErrorLorasOpen] = useState(false);

    useEffect(() => {
        setErrorLorasOpen(errorLoras.length > 0)
    }, [errorLoras])

    const refresh = (hard?: boolean) => {
        if (hard) {
            hardRefreshApi.fetch((data) => {
                if (data) {
                    setLoras(data.models ?? [])
                    setErrorLoras(data.errorModels ?? [])
                }
            })
        } else {
            lorasApi.fetch()
        }
    }

    useEffect(() => {
        if (lorasApi.data) setLoras(lorasApi.data)
    }, [lorasApi.data])

    return <LoraContext.Provider value={{ loading: lorasApi.loading || hardRefreshApi.loading, loras, refresh }}>
        <Dialog open={errorLorasOpen} onClose={() => setErrorLorasOpen(false)} maxWidth={"md"} fullWidth>
            <DialogTitle>Some LoRAs could not be added to Chamomile</DialogTitle>
            <DialogContent>
                <div>You may need to remove or edit these LoRAs externally to add them to Chamomile</div>
                <div style={{ display: 'flex', flexDirection: 'column', height: "60vh", overflowY: 'auto', gap: "10px", marginTop: "20px" }}>
                    {errorLoras.map(a =>
                        <Card style={{ flexShrink: '0' }}>
                            <CardContent>
                                <div><span style={{ fontWeight: "600" }}>{a.name}</span><span style={{ fontSize: ".9em", opacity: ".8", marginLeft: "10px" }}>({a.id})</span></div>
                                <div style={{ fontSize: ".8em", opacity: ".7" }}>{a.description}</div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setErrorLorasOpen(false)}>OK</Button>
            </DialogActions>
        </Dialog>
        {props.children}
    </LoraContext.Provider>

}