import { useContext } from "react";
import { UpscalersContext, UpscalersContextType } from "../contexts/UpscalersContext";


export const useUpscalers = () => {
    const context = useContext(UpscalersContext);
    if (!context) { throw new Error('AAAA!'); }
    return context as UpscalersContextType;
};