import { Children, isValidElement, ReactElement, ReactNode, useState } from "react";
import { useWindowDimensions } from "../../../../hooks/useWindowDimensions";
import { Button, MenuItem, Select, Tab, Tabs } from "@mui/material";
import HelpSection from "./HelpSection";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

export default function HelpDisplay(props: {
    children: ReactNode,
    tabsWidth?: number
    height?: string
}) {

    const { children } = props
    const tabsWidth = props.tabsWidth ?? 200

    const { width } = useWindowDimensions();

    const selectMode = width < tabsWidth * 3
    const [selectedTab, setSelectedTab] = useState(0)

    const helpSections = Children.toArray(children).filter(child => isValidElement(child) && child.type === HelpSection) as ReactElement[];
    const helpSectionTitles = helpSections.map(a => a.props?.title) as string[];

    if (selectMode) {
        return <div style={{ display: 'flex', flexDirection: 'column', gap: "10px", width: "100%", overflowY: 'hidden' }}>
            <Select
                value={selectedTab}
                onChange={(e) => setSelectedTab(e.target.value as number)}
                fullWidth
            >
                {helpSectionTitles.map((a, i) => <MenuItem key={a} value={i}>{a}</MenuItem>)}
            </Select>
            <hr style={{ width: "100%" }} />

            <div style={{ fontSize: '1.25em', fontFamily: "Merriweather" }}>{helpSectionTitles[selectedTab]}</div>
            <hr style={{ width: "100%" }} />
            <div style={{ flex: "1", overflowY: "auto" }}>
                {helpSections[selectedTab]}
            </div>

        </div>
    }

    return <>
        <div style={{ width: `${tabsWidth}px`, overflowY: "hidden" }}>
            <Tabs
                value={selectedTab}
                onChange={(_, val) => setSelectedTab(val as number)}
                orientation="vertical"
                scrollButtons="auto"
                variant="scrollable"
                style={{ height: props.height }}
                sx={{
                    alignItems: 'flex-start',
                    '& .MuiTabs-flexContainer': {
                        // alignItems: 'flex-start'
                    },
                    '& .MuiTab-root': {
                        textTransform: 'none',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        minHeight: 16,
                        paddingTop: "10px",
                        paddingBottom: "10px"
                    }
                }}
            >
                {helpSectionTitles.map((a, i) => <Tab key={a} value={i} label={a} />)}
            </Tabs>
        </div>
        <hr />
        <div style={{ flex: "1", overflowY: "hidden", display: 'flex', flexDirection: 'column' }}>
            <div>
                <div style={{ fontSize: '1.75em', fontFamily: "Merriweather" }}>{helpSectionTitles[selectedTab]}</div>
                <hr style={{ width: "100%" }} />
            </div>
            <div style={{ flex: "1", overflowY: "auto", paddingRight: '10%', fontSize: ".9em" }}>
                {helpSections[selectedTab]}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: ".8em" }}>
                <div style={{ maxWidth: "50%", textAlign: "left" }}>
                    {selectedTab > 0 && (
                        <Button
                            startIcon={<ChevronLeft />}
                            onClick={() => setSelectedTab(selectedTab - 1)}
                            sx={{
                                fontSize: "1em",
                                textTransform: "none",
                                justifyContent: "flex-start",
                                textAlign: "left"
                            }}
                            fullWidth
                        >
                            {helpSectionTitles[selectedTab - 1]}
                        </Button>
                    )}
                </div>
                <div style={{ maxWidth: "50%", textAlign: "right" }}>
                    {selectedTab < helpSectionTitles.length - 1 && (
                        <Button
                            endIcon={<ChevronRight />}
                            onClick={() => setSelectedTab(selectedTab + 1)}
                            sx={{
                                fontSize: "1em",
                                textTransform: "none",
                                textAlign: 'right',
                                justifyContent: "flex-end",
                            }}
                            fullWidth
                        >
                            {helpSectionTitles[selectedTab + 1]}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    </>

}