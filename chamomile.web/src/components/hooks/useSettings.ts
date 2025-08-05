import { useContext } from "react";
import { SettingsContext, SettingsContextType } from "../contexts/SettingsContext";


export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) { throw new Error('AAAA!'); }
    return context as SettingsContextType
        ;
};