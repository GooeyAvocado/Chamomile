import { FormControl, InputAdornment, MenuItem, Select } from "@mui/material";
import { getSchedulers } from "../../../api/Prompts";
import useApi from "../../hooks/useApi";
import { Schedule } from "@mui/icons-material";

export default function SchedulerSelector(props: {
    scheduler: string,
    setScheduler: (val: string) => void
    style?: React.CSSProperties
}) {

    const { scheduler, setScheduler, style } = props
    const { data } = useApi(getSchedulers, true)

    return <FormControl fullWidth style={style}>
        <Select
            disabled={!data}
            value={scheduler ?? ""}
            onChange={(e) => setScheduler(e.target.value)}
            startAdornment={
                <InputAdornment position="start">
                    <Schedule />
                </InputAdornment>
            }
            endAdornment={
                <InputAdornment position="end">
                    <div style={{ marginRight: "15px" }}>Scheduler</div>
                </InputAdornment>
            }
        >
            {data?.map(a => <MenuItem key={a.label} value={a.label}>{a.label}</MenuItem>)}
        </Select>
    </FormControl>


}