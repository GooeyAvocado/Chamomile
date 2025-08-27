export default interface PromptOrderData {
    source: "IMAGE_BASE" | "IMAGE" | "SAVED_PROMPT" | "PROMPTBOX" | "UNKNOWN" | "UPLOAD"
    sample: number
    albums: number[]
}