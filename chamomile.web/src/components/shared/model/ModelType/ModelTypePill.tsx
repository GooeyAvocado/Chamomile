export default function ModelTypePill(props: {type:string, bgColor?:string}) {
    return <div style={{backgroundColor:props.bgColor ?? `rgba(255,255,255,0.3)`, fontWeight:'bold', padding:'0px 5px', fontSize:'.7em', color:'white'}}>{props.type}</div>
}