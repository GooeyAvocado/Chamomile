import StatsValue from "./StatsValue"

export default function StatsNumber({ val, label, fontSize }: {
    val: number
    label: string
    fontSize?: string
}) {

    const displayNumber = val > 1000 ? Math.floor(val / 1000).toLocaleString() + "k+" : val?.toLocaleString()

    return <StatsValue
        tooltip={val > 1000 ? val.toLocaleString() : undefined}
        val={displayNumber}
        label={label}
        fontSize={fontSize}
    />

}