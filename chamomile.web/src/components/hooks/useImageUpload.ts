import { useContext } from "react";
import { ImageUploadContext, ImageUploadContextType } from "../contexts/ImageUploadContext";


export const useImageUpload = () => {
    const context = useContext(ImageUploadContext);
    if (!context) { throw new Error('AAAA!'); }
    return context as ImageUploadContextType;
};