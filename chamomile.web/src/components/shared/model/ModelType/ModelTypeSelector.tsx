import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export default function ModelTypeSelector(props: {
    modelType?: string
    setModelType: (val: string) => void
}) {
    const { modelType, setModelType } = props

    return <FormControl fullWidth>
        <InputLabel>Base Model Type</InputLabel>
        <Select
            value={modelType ?? ""}
            label="Base Model Type"
            onChange={(e) => setModelType(e.target.value)}
        >
            <MenuItem value={""}>Unknown</MenuItem>
            <MenuItem value={"SD"}>Stable Diffusion</MenuItem>
            <MenuItem value={"SDXL"}>Stable Diffusion XL</MenuItem>
            <MenuItem value={"PONY"}>PonyXL</MenuItem>
            <MenuItem value={"IL"}>Illustrious</MenuItem>
            <MenuItem value={"NAI"}>NoobAI</MenuItem>
        </Select>
    </FormControl>

}