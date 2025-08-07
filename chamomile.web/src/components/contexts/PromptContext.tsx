import { createContext, useState } from "react";
import { Prompt } from "../../model/Prompt";
import { Album } from "../../model/Album";
import { useSettings } from "../hooks/useSettings";

export interface PromptContextType {
    prompt: Prompt,
    setPrompt: (val: Prompt, globalOverride?: boolean) => void,
    orderAmount: number,
    setOrderAmount: (val: number) => void,
    variables: any,
    setVairables: (val: any) => void,
    album?: Album,
    setAlbum: (val?: Album) => void
}

export const PromptContext = createContext<PromptContextType | undefined>(undefined)

export default function PromptProvider(props: { children: any }) {

    const { settings } = useSettings()

    const [orderAmount, setOrderAmount] = useState(settings.defaults.amount)
    const [album, setAlbum] = useState(undefined as Album | undefined);

    const [prompt, setPrompt] = useState({
        cfgScale: settings.defaults.cfg,
        width: settings.defaults.width,
        height: settings.defaults.height,
        positivePrompt: "",
        negativePrompt: settings.defaults.negativePrompt,
        sampler: settings.defaults.sampler,
        scheduleType: settings.defaults.scheduler,
        seed: -1,
        steps: settings.defaults.steps
    } as Prompt)

    const [variables, setVariables] = useState({} as any)

    return <PromptContext.Provider value={{
        orderAmount: orderAmount, setOrderAmount: setOrderAmount,
        prompt: prompt, setPrompt: (val, override) => {
            setPrompt(override ? val : {

                ...val, ...{
                    cfgScale: settings.globals.cfg ? prompt.cfgScale : val.cfgScale,
                    sampler: settings.globals.sampler ? prompt.sampler : val.sampler,
                    steps: settings.globals.steps ? prompt.steps : val.steps,
                    width: settings.globals.width ? prompt.width : val.width,
                    height: settings.globals.height ? prompt.height : val.height

                }
            })
        },
        setVairables: setVariables, variables: variables,
        album: album, setAlbum: setAlbum
    } as PromptContextType}>
        {props.children}
    </PromptContext.Provider>
}