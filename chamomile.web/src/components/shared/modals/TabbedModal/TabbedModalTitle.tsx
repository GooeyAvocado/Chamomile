import { CSSProperties, ReactNode } from "react";

export default function TabbedModalTitle(props:{
    style?: CSSProperties
    children?: ReactNode
}){
    const {style,children} = props
    return style ? <div style={style}>{children}</div> : children
}
