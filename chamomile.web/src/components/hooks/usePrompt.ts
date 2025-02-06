import { useContext } from "react";
import { PromptContext, PromptContextType } from "../contexts/PromptContext";


export const usePrompt = () => {
    const context = useContext(PromptContext);
    if (!context) { throw new Error('AAAA!'); }
    return context as PromptContextType;
};