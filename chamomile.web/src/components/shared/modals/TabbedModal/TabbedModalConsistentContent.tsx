import { CSSProperties, ReactNode } from "react";

export interface TabbedModalConsistentContentProps {
    style?: CSSProperties
    children?: ReactNode
    position: "top" | "bottom"
}

export default function TabbedModalConsistentContent(props: TabbedModalConsistentContentProps) {
    const { style, children } = props
    return style ? <div style={style}>{children}</div> : children
}
