import { CSSProperties, ReactNode } from "react";

export interface TabbedModalTabContentProps {
    style?: CSSProperties
    children?: ReactNode
    label: string
}

export default function TabbedModalTabContent(props: TabbedModalTabContentProps) {
    const { style, children } = props
    return style ? <div style={style}>{children}</div> : children
}
