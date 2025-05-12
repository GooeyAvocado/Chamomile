import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export default function AvailabilitySelector(props: {
    availability: -1|0|1
    setAvailability: (val: -1|0|1) => void
}) {
    const { setAvailability, availability } = props

    return <FormControl fullWidth>
        <InputLabel>Availability</InputLabel>
        <Select
            value={availability}
            label="Availability"
            onChange={(e) => setAvailability(e.target.value as (0|1|-1))}
        >
            <MenuItem value={0}>Any</MenuItem>
            <MenuItem value={-1}>Unavailable</MenuItem>
            <MenuItem value={1}>Available</MenuItem>
        </Select>
    </FormControl>

}