export default function ChamomileLogo(props: {
    hideWords?: boolean
    wordsOverride?: string
    vertical?: boolean
}) {

    const additionalStyle = props.vertical ? {
        flexDirection: 'column',
        alignItems: 'center'
    } as React.CSSProperties : {}

    return <div style={{ display: "flex", alignItems: 'flex-end', ...additionalStyle }}>
        <img src="color.png" width={"64"} />
        {!props.hideWords && <div style={{
            marginBottom: "-2px", fontSize: "1.7em", fontFamily: "Merriweather"
        }}>
            {props.wordsOverride ?? "Chamomile"}
        </div>}
    </div>
}