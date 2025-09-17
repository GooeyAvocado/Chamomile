import { Tooltip } from "@mui/material"

export default function StatsValue({ val, label, fontSize, tooltip }: {
    val: string
    tooltip?: string
    label: string
    fontSize?: string
}) {


    return <div style={{ textAlign: 'center' }}>
        {tooltip
            ? <Tooltip title={tooltip}><div style={{ fontSize: fontSize ?? '3em', fontFamily: "Merriweather" }}>{val}</div></Tooltip>
            : <div style={{ fontSize: fontSize ?? '3em', fontFamily: "Merriweather" }}>{val}</div>}
        <div style={{ fontSize: '.8em' }}>{label} </div>
    </div>

}