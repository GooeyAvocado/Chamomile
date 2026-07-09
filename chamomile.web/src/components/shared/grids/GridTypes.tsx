import { DirectionsRun, ModelTraining, OpenWith, ReceiptLong, Schedule, Tune, Window, Yard } from "@mui/icons-material";
// import { Prompt } from "../../../model/Prompt";

export type GridAxisInputType = "none" | "string" | "multiline" | "float" | "int" | "sampler" | "model" | "dimensions" | "scheduler" | "lora";
export type GridAxisCode = "NON" | "POS" | "NEG" | "PSR" | "MOD" | "LOR" | "CFG" | "SEED" | "DIMN" | "STEP" | "SMPL" | "SCHD" | "PSFX" | "NSFX"
export type GridAxisGroup = "Prompt" | "Models" | "Tuning" | ""

export const GridAxisGroups = ["Prompt", "Models", "Tuning"] as GridAxisGroup[]

export interface GridType {
    code: GridAxisCode;
    name: string;
    group?: GridAxisGroup
    type: GridAxisInputType;
    prefix: React.ReactNode;
    suffix: string;
    displayValue?: (val: string) => React.ReactNode
}

export const GridTypes: GridType[] = [
    {
        code: "NON",
        name: "None",
        type: "none",
        prefix: <></>,
        suffix: "",
    },
    {
        code: "PSR",
        name: "Prompt search/replace",
        group: "Prompt",
        type: "string",
        prefix: <ReceiptLong fontSize="inherit" />,
        suffix: "",
    },
    {
        code: "POS",
        name: "Positive Prompt",
        group: "Prompt",
        type: "multiline",
        prefix: <ReceiptLong fontSize="inherit" />,
        suffix: "",
    },
    {
        code: "NEG",
        name: "Negative Prompt",
        group: "Prompt",
        type: "multiline",
        prefix: <ReceiptLong fontSize="inherit" />,
        suffix: "",
    },
    {
        code: "PSFX",
        name: "Positive Prompt Suffix",
        group: "Prompt",
        type: "multiline",
        prefix: <ReceiptLong fontSize="inherit" />,
        suffix: "",
    },
    {
        code: "NSFX",
        name: "Negative Prompt Suffix",
        group: "Prompt",
        type: "multiline",
        prefix: <ReceiptLong fontSize="inherit" />,
        suffix: "",
    },
    {
        code: "MOD",
        name: "Checkpoint",
        group: "Models",
        type: "model",
        prefix: <ModelTraining fontSize="inherit" />,
        suffix: "",
        displayValue: (val: string) => <>{val.replace(".safetensors", "").replaceAll("_", " ")}</>,
    },
    {
        code: "LOR",
        name: "Lora",
        group: "Models",
        type: "lora",
        prefix: <ModelTraining fontSize="inherit" />,
        suffix: "",
    },
    {
        code: "CFG",
        name: "CFG Scale",
        group: "Tuning",
        type: "float",
        prefix: <Tune fontSize="inherit" />,
        suffix: "",
    },
    {
        code: "SEED",
        name: "Seed",
        group: "Tuning",
        type: "int",
        prefix: <Yard fontSize="inherit" />,
        suffix: "",
    },
    {
        code: "DIMN",
        name: "Dimensions",
        group: "Tuning",
        type: "dimensions",
        prefix: <OpenWith fontSize="inherit" />,
        suffix: "px",
    },
    {
        code: "STEP",
        name: "Steps",
        group: "Tuning",
        type: "int",
        suffix: "",
        prefix: <DirectionsRun fontSize="inherit" />,
    },
    {
        code: "SMPL",
        name: "Sampler",
        group: "Tuning",
        type: "sampler",
        prefix: <Window fontSize="inherit" />,
        suffix: "",
    },
    {
        code: "SCHD",
        name: "Scheduler",
        group: "Tuning",
        type: "scheduler",
        prefix: <Schedule fontSize="inherit" />,
        suffix: "",
    }
]