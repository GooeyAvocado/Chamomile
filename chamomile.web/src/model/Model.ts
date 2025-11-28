export class Model {
    id: string = "";
    name: string = "";
    type: string = "";
    description: string = "";
    samplePrompt: string = "";
    isAvailable: boolean = true;
    bannerImage?: number;
    tags?: string[];
}

export type ModelType = 'Checkpoint' | 'LoRA'
