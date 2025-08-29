import { DirectionsRun, Height, ReceiptLong, Schedule, Tune, Window, Yard } from "@mui/icons-material";
import { Prompt } from "../../../model/Prompt";

export interface GridType {
    code: string;
    name: string;
    type: string;
    prefix: React.ReactNode;
    suffix: string;
    applyToPrompt: (prompt: Prompt, val: string, vals: string[]) => Prompt;
}

export const GridTypes: GridType[] = [
    {
        code: "NON",
        name: "None",
        type: "none",
        prefix: <></>,
        suffix: "",
        applyToPrompt: (prompt: Prompt) => prompt
    },
    {
        code: "PSR",
        name: "Prompt search/replace",
        type: "string",
        prefix: <ReceiptLong fontSize="inherit" />,
        suffix: "",
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
        prefix: <Tune fontSize="inherit" />,
        suffix: "",
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
        prefix: <Yard fontSize="inherit" />,
        suffix: "",
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
        prefix: <Height style={{ transform: "rotate(90deg)" }} fontSize="inherit" />,
        suffix: "px",
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
        prefix: <Height fontSize="inherit" />,
        suffix: "px",
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
        suffix: "",
        prefix: <DirectionsRun fontSize="inherit" />,
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
        prefix: <Window fontSize="inherit" />,
        suffix: "",
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
        prefix: <Schedule fontSize="inherit" />,
        suffix: "",
        applyToPrompt: (prompt: Prompt, val: string) => {
            return {
                ...prompt,
                scheduleType: val
            } as Prompt
        }
    }
]