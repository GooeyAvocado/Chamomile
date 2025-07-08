import { useContext } from "react";
import { AlbumsContext, AlbumsContextType } from "../contexts/AlbumsContext";


export const useAlbums = () => {
    const context = useContext(AlbumsContext);
    if (!context) { throw new Error('AAAA!'); }
    return context as AlbumsContextType;
};