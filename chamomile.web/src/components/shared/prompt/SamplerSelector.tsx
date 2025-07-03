import { FormControl, InputAdornment, MenuItem, Select } from "@mui/material";
import { getSamplers } from "../../../api/Prompts";
import useApi from "../../hooks/useApi";
import { Window } from "@mui/icons-material";

export default function SamplerSelector(props: {
    sampler: string,
    setSampler: (val: string) => void
}) {

    const { sampler, setSampler } = props
    const { data } = useApi(getSamplers, true)

    return <FormControl fullWidth>
        <Select
            disabled={!data}
            value={sampler ?? ""}
            onChange={(e) => setSampler(e.target.value)}
            startAdornment={
                <InputAdornment position="start">
                    <Window />
                </InputAdornment>
            }
            endAdornment={
                <InputAdornment position="end">
                    <div style={{ marginRight: "15px" }}>Sampler</div>
                </InputAdornment>
            }
        >
            {data?.map(a => <MenuItem key={a.name} value={a.name}>{a.name}</MenuItem>)}
        </Select>
    </FormControl>


}