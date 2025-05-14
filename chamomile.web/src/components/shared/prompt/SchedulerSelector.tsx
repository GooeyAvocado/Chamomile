import { FormControl, InputAdornment, InputLabel, MenuItem, Select } from "@mui/material";
import { getSchedulers } from "../../../api/Prompts";
import useApi from "../../hooks/useApi";
import { Schedule } from "@mui/icons-material";

export default function SchedulerSelector(props:{
    scheduler: string,
    setScheduler: (val:string) => void
}){

    const {scheduler,setScheduler} = props
    const {data} = useApi(getSchedulers,true)

    return <FormControl fullWidth>
        <InputLabel>Scheduler</InputLabel>
        <Select
            disabled={!data}
            value={scheduler ?? ""}
            label="Scheduler"
            onChange={(e) => setScheduler(e.target.value)}
            startAdornment={
                <InputAdornment position="start">
                    <Schedule/>
                </InputAdornment>
            }
        >
            {data?.map(a=><MenuItem value={a.label}>{a.label}</MenuItem>)}
        </Select>
    </FormControl>
    

}