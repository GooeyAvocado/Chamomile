import { FormControl, InputAdornment, InputLabel, MenuItem, Select } from "@mui/material";
import { getSamplers } from "../../../api/Prompts";
import useApi from "../../hooks/useApi";
import { Window } from "@mui/icons-material";

export default function SamplerSelector(props:{
    sampler: string,
    setSampler: (val:string) => void
}){

    const {sampler,setSampler} = props
    const {data} = useApi(getSamplers,true)

    return <FormControl fullWidth>
        <InputLabel>Sampler</InputLabel>
        <Select
            disabled={!data}
            value={sampler ?? ""}
            label="Sampler"
            onChange={(e) => setSampler(e.target.value)}
            startAdornment={
                <InputAdornment position="start">
                    <Window/>
                </InputAdornment>
            }
            endAdornment={
                <InputAdornment position="end">
                    <div style={{marginRight:"15px"}}>Sampler</div>
                </InputAdornment>
            }
        >
            {data?.map(a=><MenuItem value={a.name}>{a.name}</MenuItem>)}
        </Select>
    </FormControl>
    

}