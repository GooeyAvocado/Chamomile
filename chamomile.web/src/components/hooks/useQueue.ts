import { useContext, useEffect } from "react";
import { QueueContext, QueueContextType } from "../contexts/QueueContext";
import { GeneratedImage } from "../../model/GeneratedImage";


export const useQueue = (onSuccess?: (val: GeneratedImage) => void) => {
    const context = useContext(QueueContext);
    if (!context) { throw new Error('AAAA!'); }

    useEffect(() => {
        if (context.lastSuccessfulImage) onSuccess?.(context.lastSuccessfulImage)
    }, [context.lastSuccessfulImage])

    return context as QueueContextType;
};