export default function ChamomileLogo(props:{
    hideWords?: boolean
}) {
    return <div style={{ display: "flex", alignItems: 'flex-end' }}>
        <img src="color.png" width={"64"} />
        {!props.hideWords && <div style={{ 
            marginBottom: "-2px", fontSize: "1.7em", fontFamily: "Merriweather" 
        }}>
            Chamomile
        </div>}
    </div>
}