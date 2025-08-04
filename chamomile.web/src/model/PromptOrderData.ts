export default interface PromptOrderData {
    source: "IMAGE_BASE" | "IMAGE" | "SAVED_PROMPT" | "PROMPTBOX" | "UNKNOWN"
    sample: number
    albums: number[]
}