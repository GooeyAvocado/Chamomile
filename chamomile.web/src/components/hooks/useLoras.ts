import { useContext } from "react";
import { LoraContext, LoraContextType } from "../contexts/LoraContext";


export const useLoras = () => {
    const context = useContext(LoraContext);
    if (!context) { throw new Error('AAAA!'); }
    return context as LoraContextType;
};