export interface ComplexAccordionBodyProps {
    style?: React.CSSProperties
    children?: React.ReactNode
}

export default function ComplexAccordionBody({ style, children }: ComplexAccordionBodyProps) {
    return style ? <div style={style}>{children ?? ""}</div> : children
}