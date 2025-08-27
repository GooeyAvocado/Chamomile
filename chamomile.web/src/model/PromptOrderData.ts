export default interface PromptOrderData {
    source: "IMAGE_BASE" | "IMAGE" | "SAVED_PROMPT" | "PROMPTBOX" | "UNKNOWN" | "UPLOAD" | "GRID"
    sample: number
    albums: number[]
}