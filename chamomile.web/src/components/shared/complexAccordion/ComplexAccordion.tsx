import { Card, IconButton } from "@mui/material"
import { Children, isValidElement, useEffect, useRef, useState } from "react"
import ComplexAccordionBody from "./ComplexAccordionBody"
import ComplexAccordionActions, { ComplexAccordionActionsProps } from "./ComplexAccordionActions"
import { ExpandMore } from "@mui/icons-material"

export default function ComplexAccordion({ title, iconOverride, noIconRotate, style, disabled, elevation, defaultExpanded, ...props }: {
    title?: React.ReactNode,
    iconOverride?: React.ReactNode
    noIconRotate?: boolean
    children?: React.ReactNode
    style?: React.CSSProperties
    disabled?: boolean
    elevation?: number
    defaultExpanded?: boolean
}) {

    const [expanded, setExpanded] = useState(defaultExpanded ?? false)
    const [init, setInit] = useState(false)
    const [showActions, setShowActions] = useState<"collapsed" | "expanded">(defaultExpanded ? "expanded" : "collapsed")
    const [actionsOpacity, setActionsOpacity] = useState(1)
    const contentRef = useRef<HTMLDivElement>(null);
    const children = Children.toArray(props.children)

    const body = children.find(a => isValidElement(a) && a.type === ComplexAccordionBody) as React.ReactElement
    const actions = children.filter(a => isValidElement(a) && a.type === ComplexAccordionActions) as React.ReactElement[]
    const leftActions = actions.filter(a => (a.props as ComplexAccordionActionsProps).position === "left")
    const rightActions = actions.filter(a => (a.props as ComplexAccordionActionsProps).position === "right")

    const [maxHeight, setMaxHeight] = useState("0px");

    useEffect(() => {
        if (!init) {
            setInit(true)
            return;
        }
        setActionsOpacity(0);
        setTimeout(() => {
            setActionsOpacity(1)
            setShowActions(expanded ? "expanded" : "collapsed")
        }, 150)
    }, [expanded]);

    useEffect(() => {
        if (contentRef.current) {
            setMaxHeight(expanded ? `${contentRef.current.scrollHeight + 10}px` : "0px");
        }
    }, [expanded, body]);


    return <Card style={style} elevation={elevation}>
        <div style={{ padding: "10px", display: 'flex', gap: "5px", alignItems: 'center' }}>
            <b style={{ marginRight: '10px', display: "flex", gap: "5px", flexShrink: 0 }}>{title}</b>
            <div style={{ flex: '1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '5px', flex: "1" }}>
                    {leftActions.filter(a => (a.props as ComplexAccordionActionsProps).showOnState === "any")}
                    <div style={{ opacity: actionsOpacity, transition: "opacity 0.15s ease" }}>{leftActions.filter(a => (a.props as ComplexAccordionActionsProps).showOnState === showActions)}</div>
                </div>
                <div style={{ display: 'flex', gap: "5px", alignItems: 'center', flexShrink: '0' }}>
                    <div>
                        {rightActions.filter(a => (a.props as ComplexAccordionActionsProps).showOnState === "any")}
                        <div style={{ opacity: actionsOpacity, transition: "opacity 0.15s ease" }}>{rightActions.filter(a => (a.props as ComplexAccordionActionsProps).showOnState === showActions)}</div>
                    </div>
                    <IconButton
                        style={{
                            transition: "transform 0.3s", flexShrink: 0,
                            transform: expanded && !noIconRotate ? "rotate(180deg)" : "rotate(0deg)"
                        }}
                        onClick={() => setExpanded(e => !e)}
                        disabled={disabled}
                    >
                        {iconOverride ?? <ExpandMore />}
                    </IconButton>
                </div>
            </div>
        </div>

        <div
            ref={contentRef}
            style={{
                paddingLeft: "10px",
                paddingRight: "10px",
                paddingBottom: expanded ? "10px" : "0px",
                overflowY: 'hidden',
                maxHeight: maxHeight,
                opacity: expanded ? 1 : 0,
                transition: "max-height 0.3s ease, opacity 0.3s ease, padding-left 0.3s ease, padding-right 0.3s ease, padding-bottom 0.3s ease"
            }}>
            {body}
        </div>


    </Card>


}