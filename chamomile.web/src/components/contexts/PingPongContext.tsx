import React, { createContext } from "react";
import useApi from "../hooks/useApi";
import { pingPong } from "../../api/PingPong";
import { Card, CircularProgress } from "@mui/material";
import { CheckCircle, Warning } from "@mui/icons-material";

export class PingPongContextType {
    public constructor(
        public refreshPing: () => void,
        public loading: boolean,
        public error: boolean,
        public pong?: { DB: boolean, SD: boolean }
    ) { }
}

export function CenteredCard(props: { children: React.ReactNode, image: string }) {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: 'center', justifyContent: 'center', height: "100vh", width: "100vw", overflow: "hidden" }}>
        <Card elevation={10} style={{ maxWidth: '50vh', width: '400px' }}>
            <img src={props.image} width={"100%"} />
            <div style={{ paddingLeft: "20px", paddingRight: "20px", paddingBottom: "20px", paddingTop: "10px" }}>
                {props.children}
            </div>

        </Card>
    </div>

}

export const PingPongContext = createContext<PingPongContextType | undefined>(undefined);

export const PingPongProvider = (props: { children: any }) => {

    const pingPongApi = useApi(pingPong, true);

    if (pingPongApi.error) {
        console.error(pingPongApi.error)
        return <CenteredCard image="/images/pingpongerror.png">
            <b>We couldn't connect to the backend </b>
            <div style={{ fontSize: ".8em" }}>
                Something might be wrong with your configuration. Check if your API_URL is correct, and if the backend is running
            </div>
        </CenteredCard>
    }

    if (!pingPongApi.data) {
        return <CenteredCard image="/images/pingponging.png">
            <div style={{ display: "flex", gap: "20px", alignItems: 'center' }}>
                <div>
                    <CircularProgress size={32} />
                </div>
                <div>
                    <b>Connecting to the backend... </b>
                    <div style={{ fontSize: ".8em" }}>
                        Sit tight, it might need to start up
                    </div>
                </div>
            </div>
        </CenteredCard>
    }



    if (pingPongApi.data && pingPongApi.data?.DB === false) {
        return <CenteredCard image="/images/pingpongissue.png">
            <b>A dependency is unavailable! </b>
            <div>
                <div style={{display:"flex", flexDirection:"column", gap:"5px", marginTop:"10px"}}>
                    <div style={{display:"flex", gap:"10px", alignItems:'center'}}>
                        <div>{pingPongApi.data.DB ? <CheckCircle color="success"/> : <Warning color="warning"/>}</div> <div>Database Connection</div>
                    </div>
                    <div style={{display:"flex", gap:"10px", alignItems:'center'}}>
                        <div>{pingPongApi.data.SD ? <CheckCircle color="success"/> : <Warning color="warning"/>}</div> <div>Stable Diffusion API</div>
                    </div>
                </div>
            </div>
        </CenteredCard>
    }

    return <PingPongContext.Provider value={{ pong: pingPongApi.data, loading: pingPongApi.loading, refreshPing: pingPongApi.fetch, error: pingPongApi.error }}>
        {props.children}
    </PingPongContext.Provider>

}