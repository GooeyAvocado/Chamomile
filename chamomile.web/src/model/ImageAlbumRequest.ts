export default interface ImageAlbumRequest {
    mode: "ADD" | "REMOVE",
    albumId: number,
    imageIds?: number[]
}