import { createContext, useState } from "react";
import { Prompt } from "../../model/Prompt";

export class PromptContextType {
    public constructor(
        public prompt: Prompt,
        public setPrompt : (val:Prompt) => void,
        public orderAmount: number,
        public setOrderAmount : (val:number) => void,
        public variables: any,
        public setVairables : (val:any) => void,
    ) { }
}

export const PromptContext = createContext<PromptContextType | undefined>(undefined)

export default function PromptProvider(props: { children: any }) {

      const [orderAmount, setOrderAmount] = useState(1)
      
      const [prompt, setPrompt] = useState({
        cfgScale : 4.0,
        width : 1024,
        height : 1024,
        positivePrompt : "",
        negativePrompt: "",
        sampler: "DPM++ 2M",
        scheduleType: "Automatic",
        seed: -1,
        steps : 30,
      } as Prompt)

      const [variables, setVariables] = useState({} as any)

    return <PromptContext.Provider value={{orderAmount:orderAmount, setOrderAmount:setOrderAmount, prompt:prompt,setPrompt:setPrompt,setVairables:setVariables, variables:variables} as PromptContextType}>
        {props.children}
    </PromptContext.Provider>
}