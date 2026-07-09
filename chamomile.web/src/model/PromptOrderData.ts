export type PromptSource = "IMAGE_BASE" | "IMAGE" | "SAVED_PROMPT" | "PROMPTBOX" | "UNKNOWN" | "UPLOAD" | "GRID";

export default interface PromptOrderData {
    source: PromptSource
    sample: number
    albums: number[]
    gridId?: number;
    xPos?: number;
    yPos?: number;
    xVal?: string;
    yVal?: string;
    model?: string
}