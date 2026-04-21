import { Card, CardActionArea, Tooltip } from "@mui/material";
import ImageTileFromID from "../../images/ImageTileFromID";
import { useEffect, useRef, useState } from "react";
import { useWindowDimensions } from "../../../hooks/useWindowDimensions";
import KeywordUsageDatedResult from "../../../../model/KeywordUsageDatedResult";
import KeywordUsage from "../../../../model/KeywordUsage";

export const GRAPH_COLORS = ["#e57373", "#64b5f6", "#81c784", "#ffd54f", "#ba68c8", "#4db6ac", "#f06292", "#9575cd"];
export const GRAPH_DARK_COLORS = ["#683535ff", "#325a7aff", "#3f6141ff", "#756325ff", "#5a3361ff", "#265a55ff", "#6d2b41ff", "#483863ff"];

export default function DatedUsageGraph({
    data, setImageView, renderKeywordRow, graphMode
}: {
    data: KeywordUsageDatedResult
    graphMode?: "DAILY" | "CUMULATIVE"
    setImageView: (val: number) => void
    renderKeywordRow?: (usage: KeywordUsage) => React.ReactNode
}) {

    const contentRef = useRef<HTMLDivElement>(null);
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();

    useEffect(() => {
        if (contentRef.current) {
            setGraphHeight(contentRef.current.scrollHeight);
            setGraphWidth(contentRef.current.scrollWidth);
        }
    }, [contentRef.current, windowHeight, windowWidth]);

    const [graphHeight, setGraphHeight] = useState(0)
    const [graphWidth, setGraphWidth] = useState(0)

    return <div style={{ display: "flex", flex: "1", flexDirection: 'column' }}>
        <div ref={contentRef} style={{ flex: '1', background: "#333333", position: "relative" }}>
            {/* This is where the graph goes */}
            {/* All this because I really *REALLY* don't want to have to deal with a graphing library */}
            {/* Thank you to ChatGPT I thought I aws going to need to figure this out but as it turns out ChatGPT can do it all for me */}
            {/* The AI is used on this app for more than just the image generation */}
            {data && (
                <svg
                    width={graphWidth}
                    height={graphHeight}
                    style={{
                        position: "absolute", top: 0, left: 0,
                        width: "100%", height: "100%",
                        paddingLeft: "0px", // Increased padding for labels
                        boxSizing: "border-box"
                    }}
                >
                    {/* Padding values */}
                    {(() => {
                        const paddingLeft = 60; // Increased from 32 to 60 for 6 digits
                        const paddingRight = 32;
                        const paddingTop = 32;
                        const paddingBottom = 32;
                        const innerWidth = graphWidth - paddingLeft - paddingRight;
                        const innerHeight = graphHeight - paddingTop - paddingBottom;

                        // Vertical ticks (usage)
                        const vTicks = 8;
                        const maxUsage = graphMode === "CUMULATIVE" ? (data.maxCumulativeUsage ?? 100) * 1.1 : (data.maxUsage ?? 100) * 1.1;
                        const usageStep = maxUsage / vTicks;

                        // Horizontal ticks (time)
                        const hTicks = 15;
                        const minTs = new Date((data.minTs ?? "").split("T")[0]);
                        const maxTs = new Date((data.maxTs ?? "").split("T")[0]);
                        const onlyOneDate = minTs.getTime() === maxTs.getTime()
                        const timeStep = (maxTs.getTime() - minTs.getTime()) / (hTicks - 1);

                        return (
                            <>
                                {/* Vertical grid lines & labels */}
                                {Array.from({ length: hTicks - 1 }).map((_, i) => {
                                    const x = paddingLeft + (innerWidth / (hTicks - 1)) * i;
                                    const ts = new Date(minTs.getTime() + timeStep * i);
                                    const label = ts.toLocaleDateString();
                                    return (
                                        <g key={`v-${i}`}>
                                            <line
                                                x1={x}
                                                y1={paddingTop}
                                                x2={x}
                                                y2={graphHeight - paddingBottom}
                                                stroke="#ccc"
                                                strokeWidth={1}
                                            />
                                            {/* Date label */}
                                            {i % 2 && <text
                                                x={x}
                                                y={graphHeight - paddingBottom + 18}
                                                textAnchor="middle"
                                                fontSize="12"
                                                fill="#888"
                                            >
                                                {label}
                                            </text>}
                                        </g>
                                    );
                                })}

                                {/* Horizontal grid lines & labels */}
                                {Array.from({ length: vTicks }).map((_, i) => {
                                    const y = graphHeight - paddingBottom - (innerHeight / vTicks) * i;
                                    const usageLabel = Math.round(usageStep * i);
                                    return (
                                        <g key={`h-${i}`}>
                                            <line
                                                x1={paddingLeft}
                                                y1={y}
                                                x2={graphWidth - paddingRight}
                                                y2={y}
                                                stroke="#ccc"
                                                strokeWidth={1}
                                            />
                                            {/* Usage label */}
                                            <text
                                                x={paddingLeft - 12} // Increased offset for 6 digits
                                                y={y + 4}
                                                textAnchor="end"
                                                fontSize="12"
                                                fill="#888"
                                            >
                                                {usageLabel.toLocaleString()}
                                            </text>
                                        </g>
                                    );
                                })}

                                {/* Draw lines for each keyword series */}
                                {Object.entries(data.usage ?? {}).map(([keyword, points], idx) => {
                                    // Assign a color for each series (simple palette)
                                    const color = GRAPH_COLORS[idx % GRAPH_COLORS.length];

                                    // Prepare points for polyline
                                    const polyPoints = points.map(pt => {
                                        const date = new Date(pt.date.split("T")[0]);
                                        const x = onlyOneDate
                                            ? paddingLeft + (.5 * innerWidth)
                                            : paddingLeft + ((date.getTime() - minTs.getTime()) / (maxTs.getTime() - minTs.getTime())) * innerWidth;
                                        const y = graphHeight - paddingBottom - ((graphMode === "CUMULATIVE" ? pt.cumulativeCount : pt.count) / maxUsage) * innerHeight;
                                        return `${x},${y}`;
                                    }).join(" ");

                                    return (
                                        <g key={keyword}>
                                            <polyline
                                                points={polyPoints}
                                                fill="none"
                                                stroke={color}
                                                strokeWidth={2}
                                            />
                                            {/* Draw circles for each point */}
                                            {points.map(pt => {
                                                const date = new Date(pt.date.split("T")[0]);
                                                const x = onlyOneDate
                                                    ? paddingLeft + (.5 * innerWidth)
                                                    : paddingLeft + ((date.getTime() - minTs.getTime()) / (maxTs.getTime() - minTs.getTime())) * innerWidth;
                                                const y = graphHeight - paddingBottom - ((graphMode === "CUMULATIVE" ? pt.cumulativeCount : pt.count) / maxUsage) * innerHeight;
                                                return (
                                                    <Tooltip title={<Card >
                                                        <CardActionArea onClick={() => { setImageView(pt.sample) }}
                                                            sx={{ textTransform: 'none' }}
                                                            style={{ display: "flex", alignItems: 'center', gap: "10px", padding: "8px" }}
                                                        >
                                                            <ImageTileFromID image={pt.sample} style={{ width: "48px" }} />
                                                            <div>
                                                                <div>{renderKeywordRow ? renderKeywordRow({
                                                                    count: (graphMode === "CUMULATIVE" ? pt.cumulativeCount : pt.count),
                                                                    keyword: pt.keyword,
                                                                    maxTs: pt.date,
                                                                    minTs: pt.date,
                                                                    sample: pt.sample,
                                                                    deletedCount: 0,
                                                                    downloadCount: 0,
                                                                    favoriteCount: 0,
                                                                    upscaleCount: 0,
                                                                    totalCount: pt.count,
                                                                    successRate: 0,
                                                                    downloadRate: 0,
                                                                    favoriteRate: 0,
                                                                    upscaleRate: 0,
                                                                }) : <>{pt.keyword[0].toUpperCase()}{pt.keyword.slice(1)}</>}</div>
                                                                <div>{date.toLocaleDateString()}: {(graphMode === "CUMULATIVE" ? pt.cumulativeCount : pt.count).toLocaleString()} usages</div>
                                                            </div>
                                                        </CardActionArea>
                                                    </Card>}>
                                                        <circle key={pt.date} cx={x} cy={y} r={onlyOneDate ? 5 : 3} fill={color} />
                                                    </Tooltip>
                                                );
                                            })}
                                        </g>
                                    );
                                })}

                            </>
                        );
                    })()}
                </svg>
            )}



        </div>
    </div>
}