export interface ComplexAccordionActionsProps {
    position: "left" | "right"
    showOnState: "expanded" | "collapsed" | "any"
    style?: React.CSSProperties
    children?: React.ReactNode
}

export default function ComplexAccordionActions({ style, children }: ComplexAccordionActionsProps) {
    return style ? <div style={style}>{children ?? ""}</div> : children
}