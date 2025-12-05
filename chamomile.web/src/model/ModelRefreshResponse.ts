import { Model } from "./Model";

export default interface ModelRefreshResponse {
    errorModels: Model[]
    models: Model[]
}