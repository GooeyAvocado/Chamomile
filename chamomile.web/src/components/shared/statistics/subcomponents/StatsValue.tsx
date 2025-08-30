export default function StatsValue({ val, label, fontSize }: {
    val: string
    label: string
    fontSize?: string
}) {


    return <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: fontSize ?? '3em', fontFamily: "Merriweather" }}>{val}</div>
        <div style={{ fontSize: '.8em' }}>{label} </div>
    </div>

}