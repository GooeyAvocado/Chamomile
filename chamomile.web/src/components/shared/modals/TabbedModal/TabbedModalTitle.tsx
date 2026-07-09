import { CSSProperties, ReactNode } from "react";

export interface TabbedModalTitleProps {
    style?: CSSProperties
    children?: ReactNode
}

export default function TabbedModalTitle(props: TabbedModalTitleProps) {
    const { style, children } = props
    return style ? <div style={style}>{children}</div> : children
}
