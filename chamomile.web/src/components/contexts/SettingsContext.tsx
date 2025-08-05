import { createContext, useEffect, useState } from "react";
import { useCookie } from "../hooks/useCookie";
import WhatsNew from "../shared/WhatsNewModal/WhatsNew";

export interface SettingsContextType {
    settings: ChamomileSettings
    setSettings: (val: ChamomileSettings) => void
    showWhatsNew: () => void
}

export interface ChamomileSettings {
    lastUsedVersion: string,
    enableSound: boolean,
    defaults: ChamomileDefaults
    globals: ChamomileGlobalFlags
}

/**
 * Indicates the default values for Chamomile
 */
export interface ChamomileDefaults {
    width: number,
    height: number,
    steps: number,
    cfg: number,
    sampler: string,
    scheduler: string,
    amount: number,
    negativePrompt: string
}

/**
 * Indicates which fields in the promptbox are considered "global", and should be used instead of the original prompt's values when using or re-brewing a prompt
 */
export interface ChamomileGlobalFlags {
    width: boolean,
    height: boolean,
    steps: boolean,
    cfg: boolean,
    sampler: boolean
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = (props: { children: any }) => {

    //We most normally change the frontend so let's just use this one
    const frontendBuild = import.meta.env.VITE_BACKEND_BUILD ?? "v3-local"

    const [settings, saveSettings] = useCookie("chamomile_settings", {
        lastUsedVersion: "",
        enableSound: true,
        defaults: {
            amount: 3,
            width: 1024,
            height: 1024,
            steps: 30,
            sampler: "DPM++ 2M",
            scheduler: "Automatic",
            cfg: 4.0,
            negativePrompt: "",
        },
        globals: {
            cfg: false,
            height: false,
            sampler: false,
            steps: false,
            width: false,
        }
    } as ChamomileSettings)

    const [wnOpen, setWnOpen] = useState(false);

    const setSettings = (val: ChamomileSettings) => {
        saveSettings({ ...settings, ...val })
    }

    useEffect(() => {
        if (settings.lastUsedVersion !== frontendBuild) {
            setSettings({ ...settings, lastUsedVersion: frontendBuild })
            setWnOpen(true)
        }
    }, [settings])

    return <SettingsContext.Provider value={{ settings, setSettings, showWhatsNew: () => setWnOpen(true) } as SettingsContextType}>
        {props.children}
        <WhatsNew open={wnOpen} setOpen={setWnOpen} />
    </SettingsContext.Provider>

}