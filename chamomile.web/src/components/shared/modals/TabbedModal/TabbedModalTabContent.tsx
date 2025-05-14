import { CSSProperties, ReactNode } from "react";

export default function TabbedModalTabContent(props:{
    style?: CSSProperties
    children?: ReactNode
    label:string
}){
    const {style,children} = props
    return style ? <div style={style}>{children}</div> : children
}
