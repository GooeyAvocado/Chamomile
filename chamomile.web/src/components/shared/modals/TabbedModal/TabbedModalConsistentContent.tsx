import { CSSProperties, ReactNode } from "react";

export default function TabbedModalConsistentContent(props:{
    style?: CSSProperties
    children?: ReactNode
    position: "top"|"bottom"
}){
    const {style,children} = props
    return style ? <div style={style}>{children}</div> : children
}
