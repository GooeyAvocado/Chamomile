import StatsValue from "./StatsValue"

export default function StatsNumber({ val, label, fontSize }: {
    val: number
    label: string
    fontSize?: string
}) {

    const displayNumber = val > 1000 ? Math.round(val / 1000).toLocaleString() + "K" : val?.toLocaleString()

    return <StatsValue
        val={displayNumber}
        label={label}
        fontSize={fontSize}
    />

}