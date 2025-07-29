import { Prompt } from "./Prompt";

export default interface ImageWorkerStatus {
    queue: Prompt[]
    currentJob?: Prompt
    paused: boolean
}