import { useContext } from "react";
import { ModelContext, ModelContextType } from "../contexts/ModelsContext";


export const useModels = () => {
    const context = useContext(ModelContext);
    if (!context) { throw new Error('AAAA!'); }
    return context as ModelContextType;
};