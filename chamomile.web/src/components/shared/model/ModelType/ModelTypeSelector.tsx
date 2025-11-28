import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import ModelTypePill from "./ModelTypePill";

export default function ModelTypeSelector(props: {
    modelType?: string
    setModelType: (val: string) => void
    allowAny?: boolean
    allowUnknown?: boolean
}) {
    const {
        modelType, setModelType,
        allowAny, allowUnknown
    } = props

    const MODEL_TYPES: Record<string, string> = {
        SD: "Stable Diffusion",
        SDXL: "Stable Diffusion XL",
        PONY: "PonyXL",
        IL: "Illustrious",
        NAI: "NoobAI",
    };

    return <FormControl fullWidth>
        <InputLabel>Model type</InputLabel>
        <Select
            value={modelType ?? ""}
            label="Model type"
            onChange={(e) => setModelType(e.target.value)}
        >
            {allowAny && <MenuItem value={""}>Any</MenuItem>}
            {allowUnknown && <MenuItem value={"?"}>Unknown</MenuItem>}
            {Object.entries(MODEL_TYPES).map(([key, label]) => (
                <MenuItem key={key} value={key}><div style={{ display: 'flex', gap: '10px' }}>
                    {/* {!allowAny && !allowUnknown && <ModelTypePill type={key} style={{ width: "50px" }} /> } */}
                    <div>{label}</div>
                </div></MenuItem>
            ))}
        </Select>
    </FormControl>

}