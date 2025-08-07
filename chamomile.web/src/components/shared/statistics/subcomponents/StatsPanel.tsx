import { useEffect, useMemo, useRef, useState } from "react";
import KeywordUsage from "../../../../model/KeywordUsage";
import { Card, CardActionArea, Chip, CircularProgress, IconButton, Paper, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import ImageTileFromID from "../../images/ImageTileFromID";
import { ChevronLeft, ChevronRight, FirstPage, LastPage, TableView, Timeline } from "@mui/icons-material";
import ImageModalFromId from "../../images/ImageModalFromId";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import ChamomileLogo from "../../ChamomileLogo";
import useApi from "../../../hooks/useApi";
import { FilterOptions } from "../../../../model/FilterOptions";
import { KeywordFilterOptions } from "../../../../model/KeywordFilterOptions";
import { useWindowDimensions } from "../../../hooks/useWindowDimensions";
import KeywordUsageDatedResult from "../../../../model/KeywordUsageDatedResult";

export function StatsPanel({
    usage, filter, datedUsageApi, keywordColumnOverride,
    renderImageTile, renderKeywordRow, rowHeightOverride,
    renderCount, getSampleImageId, minAutoCompleteLength: propMinACL,
    limit
}: {
    usage: KeywordUsage[],
    filter: FilterOptions,
    limit: number,
    renderImageTile?: (usage: KeywordUsage, setImageView: (val: number) => void) => React.ReactNode
    renderKeywordRow?: (usage: KeywordUsage) => React.ReactNode
    renderCount?: (total: number) => React.ReactNode
    getSampleImageId?: (usage: KeywordUsage) => number | undefined
    keywordColumnOverride?: string,
    rowHeightOverride?: number
    minAutoCompleteLength?: number
    datedUsageApi: (
        setLoading: (value: boolean) => void,
        setItem: (value?: KeywordUsageDatedResult) => void,
        onError: (value: any) => void,
        filter: KeywordFilterOptions
    ) => void
}) {

    const [page, setPage] = useState(0);
    const [imageView, setImageView] = useState<number | undefined>()
    const [mode, setMode] = useState<"table" | "graph">("table")
    const pageSize = 6;
    const pages = Math.ceil(usage.length / pageSize)
    const contentRef = useRef<HTMLDivElement>(null);
    const { height: windowHeight, width: windowWidth } = useWindowDimensions();

    const displayData = usage.slice(pageSize * page, pageSize * (page + 1))
    const nextPage = () => setPage(Math.min(page + 1, pages - 1))
    const prevPage = () => setPage(Math.max(0, page - 1))

    const [keywordQuery, setKeywordQuery] = useState("");
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [graphHeight, setGraphHeight] = useState(0)
    const [graphWidth, setGraphWidth] = useState(0)

    const { fetch, data, loading } = useApi(datedUsageApi)

    useEffect(() => {
        if (selectedKeywords.length > 0) {
            fetch(undefined, undefined, { ...filter, keyword: selectedKeywords.join(","), lastImage: limit } as KeywordFilterOptions)
        }
    }, [selectedKeywords])

    useEffect(() => {
        if (contentRef.current) {
            setGraphHeight(contentRef.current.scrollHeight);
            setGraphWidth(contentRef.current.scrollWidth);
        }
    }, [contentRef.current, windowHeight, windowWidth]);

    const minAutoCompleteLength = propMinACL ?? 3

    const keywordOptions = useMemo(
        () =>
            keywordQuery.length >= minAutoCompleteLength
                ? usage?.map(u => u.keyword).filter(
                    k => k.toLowerCase().includes(keywordQuery.toLowerCase())
                ) : [],
        [keywordQuery, usage, selectedKeywords]
    );

    const colors = ["#e57373", "#64b5f6", "#81c784", "#ffd54f", "#ba68c8", "#4db6ac", "#f06292", "#9575cd"];
    const darkColors = ["#683535ff", "#325a7aff", "#3f6141ff", "#756325ff", "#5a3361ff", "#265a55ff", "#6d2b41ff", "#483863ff"];
    const max = usage?.[0]?.count
    const rowHeight = rowHeightOverride ?? 36

    return <>
        <div style={{ flex: "1", display: 'flex', flexDirection: 'column' }}>
            {mode === "table" ? <TableContainer component={Paper} sx={{ width: '100%', flex: "1" }}>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ width: 48 }}></TableCell>
                        <TableCell sx={{ width: '100%' }}>{keywordColumnOverride ?? "Keyword"}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>Usage</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>First use</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>Last use</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {displayData.map(a => (
                        <TableRow key={a.keyword}>
                            <TableCell>
                                {renderImageTile ? renderImageTile(a, setImageView) : <ImageTileFromID image={getSampleImageId ? getSampleImageId(a) : a.sample} style={{ width: "32px" }} onClick={() => {
                                    const id = getSampleImageId ? getSampleImageId(a) : a.sample
                                    if (id) setImageView(id)
                                }} />}
                            </TableCell>
                            <TableCell><div style={{ position: "relative", width: "100%", height: `${rowHeight}px` }}>
                                <div style={{ background: "#556677", width: `${a.count * 100 / max}%`, height: `${rowHeight}px` }} />
                                <div style={{ position: "absolute", left: "8px", top: "0", height: `${rowHeight}px`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    {renderKeywordRow ? renderKeywordRow(a) : a.keyword}
                                </div>
                            </div></TableCell>
                            <TableCell>{a.count.toLocaleString()}</TableCell>
                            <TableCell>{new Date(a.minTs).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(a.maxTs).toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </TableContainer> : selectedKeywords.length === 0 ? <div style={{ display: 'flex', flex: "1", flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: "10px" }}>
                <ChamomileLogo hideWords />
                <div>Select a {keywordColumnOverride?.toLowerCase() ?? "keyword"}!</div>
            </div> : loading && !data ? <div style={{ display: 'flex', flex: "1", flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: "10px" }}>
                <CircularProgress />
                <div>Fetching usage data</div>
            </div> : <div style={{ display: "flex", flex: "1", flexDirection: 'column' }}>
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
                                const maxUsage = (data.maxUsage ?? 100) * 1.1;
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
                                            const color = colors[idx % colors.length];

                                            // Prepare points for polyline
                                            const polyPoints = points.map(pt => {
                                                const date = new Date(pt.date.split("T")[0]);
                                                const x = onlyOneDate
                                                    ? paddingLeft + (.5 * innerWidth)
                                                    : paddingLeft + ((date.getTime() - minTs.getTime()) / (maxTs.getTime() - minTs.getTime())) * innerWidth;
                                                const y = graphHeight - paddingBottom - (pt.count / maxUsage) * innerHeight;
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
                                                        const y = graphHeight - paddingBottom - (pt.count / maxUsage) * innerHeight;
                                                        return (
                                                            <Tooltip title={<Card >
                                                                <CardActionArea onClick={() => { setImageView(pt.sample) }}
                                                                    sx={{ textTransform: 'none' }}
                                                                    style={{ display: "flex", alignItems: 'center', gap: "10px", padding: "8px" }}
                                                                >
                                                                    <ImageTileFromID image={pt.sample} style={{ width: "48px" }} />
                                                                    <div>
                                                                        <div>{renderKeywordRow ? renderKeywordRow({
                                                                            count: pt.count,
                                                                            keyword: pt.keyword,
                                                                            maxTs: pt.date,
                                                                            minTs: pt.date,
                                                                            sample: pt.sample
                                                                        }) : <>{pt.keyword[0].toUpperCase()}{pt.keyword.slice(1)}</>}</div>
                                                                        <div>{date.toLocaleDateString()}: {pt.count.toLocaleString()} usages</div>
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
            </div>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: "10px" }}>
            <div style={{ display: "flex", gap: "10px", marginLeft: "10px", alignItems: 'center', flex: "1" }}>
                <IconButton onClick={() => { setMode(mode === "table" ? "graph" : "table") }}>
                    {mode === "table" ? <Timeline /> : <TableView />}
                </IconButton>
                {mode === "table" && (
                    renderCount ? renderCount(usage.length) :
                        <div style={{ opacity: ".7", fontSize: ".9em" }}> {usage.length} {keywordColumnOverride ?? "Keyword"}s</div>
                )}
                {mode === "graph" && <Autocomplete
                    multiple fullWidth style={{ flex: "1" }}
                    options={keywordOptions} noOptionsText={keywordQuery.length >= minAutoCompleteLength ? 'No options' : `Type at least ${minAutoCompleteLength} characters`}
                    value={selectedKeywords}
                    onChange={(_, value) => setSelectedKeywords(value)}
                    inputValue={keywordQuery}
                    onInputChange={(_, value) => setKeywordQuery(value)}
                    filterOptions={x => x} // disables built-in filtering
                    renderInput={params => (
                        <TextField
                            {...params}
                            label={`Filter ${keywordColumnOverride?.toLowerCase() ?? "keyword"}s`}
                            placeholder={selectedKeywords.length > 0 ? "" : "Search"}
                            size="small"
                        />
                    )}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            <Chip
                                variant="filled"
                                style={{ backgroundColor: darkColors[index % colors.length], color: 'white' }}
                                label={`${option}`}
                                {...getTagProps({ index })}
                            />
                        ))
                    }
                    disabled={usage.length === 0}
                />}
            </div>
            {mode === "table" && <div style={{ display: 'flex', gap: "5px", alignItems: 'center' }}>
                <IconButton onClick={() => setPage(0)} disabled={page === 0}><FirstPage /></IconButton>
                <IconButton onClick={() => prevPage()} disabled={page === 0}><ChevronLeft /></IconButton>
                <div>{page + 1}</div>
                <IconButton onClick={() => nextPage()} disabled={page === pages - 1}> <ChevronRight /></IconButton>
                <IconButton onClick={() => setPage(pages - 1)} disabled={page === pages - 1}><LastPage /></IconButton>
            </div>}
        </div>

        <ImageModalFromId image={imageView} open={!!imageView && imageView > 0} setOpen={() => setImageView(-1)} />
    </>

}
