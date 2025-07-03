import { Breakpoint, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs } from "@mui/material"
import { CSSProperties, isValidElement, ReactElement, ReactNode, useState } from "react"
import { Children } from "react";
import TabbedModalActions from "./TabbedModalActions";
import TabbedModalConsistentContent from "./TabbedModalConsistentContent";
import TabbedModalTitle from "./TabbedModalTitle";
import TabbedModalTabContent from "./TabbedModalTabContent";

export default function TabbedModal(props: {
    children: ReactNode
    open: boolean,
    setOpen: (val: boolean) => void,
    maxWidth?: Breakpoint
    fullscreen?: boolean
    fullWidth?: boolean
    contentStyle?: CSSProperties
    tabContentStyle?: CSSProperties
    titleTabStack?: boolean
}) {

    const { children, open, setOpen, maxWidth, fullscreen, fullWidth, contentStyle, tabContentStyle, titleTabStack } = props

    const [currentTab, setCurrentTab] = useState(0);
    const childrenArray = Children.toArray(children);

    const actions = childrenArray.find(child => isValidElement(child) && child.type === TabbedModalActions) as ReactElement;
    const consistentContent = childrenArray.filter(child => isValidElement(child) && child.type === TabbedModalConsistentContent) as ReactElement[];
    const title = childrenArray.find(child => isValidElement(child) && child.type === TabbedModalTitle) as ReactElement;
    const tabContents = childrenArray.filter(child => isValidElement(child) && child.type === TabbedModalTabContent) as ReactElement[];

    const tabs = tabContents.map((a, i) => {
        return {
            label: a.props?.label,
            value: i
        }
    })

    return <Dialog open={open} onClose={() => setOpen(false)} maxWidth={maxWidth} fullWidth={fullWidth} fullScreen={fullscreen}>
        <DialogTitle>
            <div style={titleTabStack
                ? { display: 'flex', flexDirection: 'column' }
                : { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
            }>
                <div style={{ flex: '1' }}>{title}</div>
                <Tabs value={currentTab} onChange={(_, val) => setCurrentTab(val)} variant="scrollable" scrollButtons="auto" style={titleTabStack ? { width: "100%" } : { flexShrink: "1" }}>
                    {tabs.map(a => <Tab key={a.value} {...a} />)}
                </Tabs>
            </div>
        </DialogTitle>
        <DialogContent style={contentStyle}>
            {consistentContent.filter(a => a.props?.position === "top")}
            <div style={tabContentStyle}>
                {tabContents?.[currentTab]}
            </div>
            {consistentContent.filter(a => a.props?.position === "bottom")}
        </DialogContent>
        <DialogActions>{actions}</DialogActions>
    </Dialog>

}