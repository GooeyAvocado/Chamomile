import { DirectionsRun, OpenWith, ReceiptLong, Schedule, Tune, Window, Yard } from "@mui/icons-material";
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
            if (!val || val?.trim().length === 0) return prompt;
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
            if (!val || val?.trim().length === 0) return prompt;
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
            if (!val || val?.trim().length === 0) return prompt;
            return {
                ...prompt,
                seed: Number.parseInt(val)
            } as Prompt
        }
    },
    {
        code: "DIMN",
        name: "Dimensions",
        type: "dimensions",
        prefix: <OpenWith fontSize="inherit" />,
        suffix: "px",
        applyToPrompt: (prompt: Prompt, val: string) => {
            if (!val || val?.trim().length === 0) return prompt;
            return {
                ...prompt,
                width: Number.parseInt(val.split("x")[0] ?? "1024"),
                height: Number.parseInt(val.split("x")[1] ?? "1024")
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
            if (!val || val?.trim().length === 0) return prompt;
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
            if (!val || val?.trim().length === 0) return prompt;
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
            if (!val || val?.trim().length === 0) return prompt;
            return {
                ...prompt,
                scheduleType: val
            } as Prompt
        }
    }
]