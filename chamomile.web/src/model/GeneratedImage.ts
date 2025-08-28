import PromptOrderData from "./PromptOrderData";

export class GeneratedImage {
    id: number = 0;
    prompt: string = "";
    basePrompt: string = "";
    negativePrompt: string = "";
    notes: string = "";
    steps: number = 30;
    sampler: string = "";
    scheduleType: string = "";
    cfgScale: number = 7;
    seed: number = -1;
    height: number = 1024;
    width: number = 1024;
    size: number = 0;
    loras: string[] = [];
    albums: number[] = []
    model: string = "";
    favorite: boolean = false;
    created: Date = new Date();
    hiResAvailable: boolean = false;
    generationDurationMs?: number = 0;
    downloadCount?: number = 0;
    hidden?: boolean
    additionalInfo?: PromptOrderData
}
