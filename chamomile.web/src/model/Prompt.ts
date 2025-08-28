import PromptOrderData from "./PromptOrderData";

export interface Prompt {
    id?: number
    name: string
    positivePrompt: string
    negativePrompt: string
    steps: number
    seed: number
    sampler: string
    scheduleType: string
    cfgScale: number
    height: number
    width: number
    sampleImage?: number;
    variables: any;
    orderData?: PromptOrderData
}
