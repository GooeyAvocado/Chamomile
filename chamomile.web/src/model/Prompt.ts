import PromptOrderData from "./PromptOrderData";

export class Prompt {
    id: number = 0;
    name: string = "";
    positivePrompt: string = "";
    negativePrompt: string = "";
    steps: number = 30;
    seed: number = -1;
    sampler: string = "";
    scheduleType: string = "";
    cfgScale: number = 7;
    height: number = 1024;
    width: number = 1024;
    sampleImage?: number;
    variables: any;
    orderData?: PromptOrderData
}
