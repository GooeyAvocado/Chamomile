import { createContext } from "react";
import useApi from "../hooks/useApi";
import { Album } from "../../model/Album";
import { getAlbums } from "../../api/Albums";

export class AlbumsContextType {
    public constructor(
        public refresh: () => void,
        public albums: Album[],
        public loading: boolean,
    ) { }
}

export const AlbumsContext = createContext<AlbumsContextType | undefined>(undefined);

export const AlbumsProvider = (props: { children: any }) => {

    const albumsApi = useApi(getAlbums, true);
    const refresh = () => { albumsApi.fetch() }

    return <AlbumsContext.Provider value={{ loading: albumsApi.loading, albums: albumsApi.data, refresh: refresh }}>
        {props.children}
    </AlbumsContext.Provider>

}