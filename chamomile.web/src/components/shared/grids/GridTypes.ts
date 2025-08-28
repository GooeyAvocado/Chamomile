import { Prompt } from "../../../model/Prompt";

export const GridTypes = [
    {
        code: "NON",
        name: "None",
        type: "none",
        applyToPrompt: (prompt: Prompt) => prompt
    },
    {
        code: "PSR",
        name: "Prompt search/replace",
        type: "string",
        applyToPrompt: (prompt: Prompt, val: string, vals: string[]) => {
            return {
                ...prompt,
                positivePrompt: prompt.positivePrompt.replaceAll(vals[0], val),
                negativePrompt: prompt.negativePrompt.replaceAll(vals[0], val)
            } as Prompt
        }
    },
    {
        code: "CFG",
        name: "CFG Scale",
        type: "float",
        applyToPrompt: (prompt: Prompt, val: string) => {
            return {
                ...prompt,
                cfgScale: Number.parseFloat(val)
            } as Prompt
        }
    },
    {
        code: "SEED",
        name: "Seed",
        type: "int",
        applyToPrompt: (prompt: Prompt, val: string) => {
            return {
                ...prompt,
                seed: Number.parseInt(val)
            } as Prompt
        }
    },
    {
        code: "WDTH",
        name: "Width",
        type: "int",
        applyToPrompt: (prompt: Prompt, val: string) => {
            return {
                ...prompt,
                width: Number.parseInt(val)
            } as Prompt
        }
    },
    {
        code: "HGHT",
        name: "Height",
        type: "int",
        applyToPrompt: (prompt: Prompt, val: string) => {
            return {
                ...prompt,
                height: Number.parseInt(val)
            } as Prompt
        }
    },
    {
        code: "STEP",
        name: "Steps",
        type: "int",
        applyToPrompt: (prompt: Prompt, val: string) => {
            return {
                ...prompt,
                steps: Number.parseInt(val)
            } as Prompt
        }
    },
    {
        code: "SMPL",
        name: "Sampler",
        type: "sampler",
        applyToPrompt: (prompt: Prompt, val: string) => {
            return {
                ...prompt,
                sampler: val
            } as Prompt
        }
    },
    {
        code: "SCHD",
        name: "Scheduler",
        type: "scheduler",
        applyToPrompt: (prompt: Prompt, val: string) => {
            return {
                ...prompt,
                scheduleType: val
            } as Prompt
        }
    }
]