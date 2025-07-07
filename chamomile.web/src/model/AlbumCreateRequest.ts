import { Album } from "./Album";

export default interface AlbumCreateRequest extends Album {
    addExisting: boolean
}