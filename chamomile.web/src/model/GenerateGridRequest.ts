export default interface GenerateGridRequest {
    id: number;
    coordinates: GenerateGridCoords[];
}

export interface GenerateGridCoords {
    x: number;
    y: number;
}
