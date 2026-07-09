import { CSSProperties, ReactNode } from "react";

export interface TabbedModalActionsProps {
    style?: CSSProperties
    children?: ReactNode
}

export default function TabbedModalActions(props: TabbedModalActionsProps) {
    const { style, children } = props
    return style ? <div style={style}>{children}</div> : children
}
