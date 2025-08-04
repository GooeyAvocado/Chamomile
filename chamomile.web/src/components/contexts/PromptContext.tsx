import { createContext, useState } from "react";
import { Prompt } from "../../model/Prompt";
import { Album } from "../../model/Album";

export interface PromptContextType {
    prompt: Prompt,
    setPrompt: (val: Prompt) => void,
    orderAmount: number,
    setOrderAmount: (val: number) => void,
    variables: any,
    setVairables: (val: any) => void,
    album?: Album,
    setAlbum: (val?: Album) => void
}

export const PromptContext = createContext<PromptContextType | undefined>(undefined)

export default function PromptProvider(props: { children: any }) {

    const [orderAmount, setOrderAmount] = useState(3)
    const [album, setAlbum] = useState(undefined as Album | undefined);

    const [prompt, setPrompt] = useState({
        cfgScale: 4.0,
        width: 1024,
        height: 1024,
        positivePrompt: "",
        negativePrompt: "",
        sampler: "DPM++ 2M",
        scheduleType: "Automatic",
        seed: -1,
        steps: 30
    } as Prompt)

    const [variables, setVariables] = useState({} as any)

    return <PromptContext.Provider value={{
        orderAmount: orderAmount, setOrderAmount: setOrderAmount,
        prompt: prompt, setPrompt: setPrompt,
        setVairables: setVariables, variables: variables,
        album: album, setAlbum: setAlbum
    } as PromptContextType}>
        {props.children}
    </PromptContext.Provider>
}