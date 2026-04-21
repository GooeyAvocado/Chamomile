import { useEffect, useMemo, useRef, useState } from "react";
import KeywordUsage from "../../../../model/KeywordUsage";
import { Chip, CircularProgress, IconButton, Paper, TableBody, TableCell, TableContainer, TableHead, TableRow, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import ImageTileFromID from "../../images/ImageTileFromID";
import { BarChart, ChevronLeft, ChevronRight, FirstPage, LastPage, SignalCellularAlt, TableView, Timeline } from "@mui/icons-material";
import ImageModalFromId from "../../images/ImageModalFromId";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import ChamomileLogo from "../../ChamomileLogo";
import useApi from "../../../hooks/useApi";
import { FilterOptions } from "../../../../model/FilterOptions";
import { KeywordFilterOptions } from "../../../../model/KeywordFilterOptions";
import { useWindowDimensions } from "../../../hooks/useWindowDimensions";
import KeywordUsageDatedResult from "../../../../model/KeywordUsageDatedResult";
import DatedUsageGraph, { GRAPH_COLORS, GRAPH_DARK_COLORS } from "./DatedUsageGraph";
import { Statistic, StatisticOptions } from "./StatSelector";
import KeywordUsageModal from "./KeywordUsageModal";

export function StatsPanel({
    usage, filter, datedUsageApi, keywordColumnOverride,
    renderImageTile, renderKeywordRow, rowHeightOverride,
    renderCount, getSampleImageId, minAutoCompleteLength: propMinACL,
    limit, children, hidePagination, hideGraph, statistic, suppressDeleted
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
    children?: React.ReactNode,
    hidePagination?: boolean
    hideGraph?: boolean
    suppressDeleted?: boolean
    statistic: Statistic
    datedUsageApi: (
        setLoading: (value: boolean) => void,
        setItem: (value?: KeywordUsageDatedResult) => void,
        onError: (value: any) => void,
        filter: KeywordFilterOptions
    ) => void
}) {


    const max = StatisticOptions[statistic]?.getStat?.(usage[0] ?? {}) ?? 0
    const rowHeight = rowHeightOverride ?? 36

    const { height: windowHeight } = useWindowDimensions();


    const tableRef = useRef<HTMLDivElement>(null)

    const [pageSize, setPageSize] = useState(1)

    useEffect(() => {
        requestAnimationFrame(() => {
            if (!tableRef.current) return;
            setPageSize(1)
            requestAnimationFrame(() => {
                if (!tableRef.current) return;
                const paddedRowHeight = rowHeight + 32
                const headerHeight = 57
                const footerHeight = 40 + 10
                const padding = 10 * 2
                const adjustments = headerHeight + footerHeight + padding - 60
                setPageSize(Math.floor((tableRef.current.scrollHeight - adjustments) / paddedRowHeight))
                setPage(0)
            })
        })
    }, [windowHeight])

    const pages = Math.ceil(usage.length / pageSize)

    const [page, setPage] = useState(0);
    const [imageView, setImageView] = useState<number | undefined>()
    const [mode, setMode] = useState<"table" | "graph">("table")
    const [graphMode, setGraphMode] = useState<"CUMULATIVE" | "DAILY">("CUMULATIVE")
    const [selectedUsage, setSelectedUsage] = useState<KeywordUsage>()
    const [usageOpen, setUsageOpen] = useState(false)


    const displayData = usage.slice(pageSize * page, pageSize * (page + 1))
    const nextPage = () => setPage(Math.min(page + 1, pages - 1))
    const prevPage = () => setPage(Math.max(0, page - 1))

    const [keywordQuery, setKeywordQuery] = useState("");
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);


    const { fetch, data, loading } = useApi(datedUsageApi)

    useEffect(() => {
        if (selectedKeywords.length > 0) {
            fetch(undefined, undefined, { ...filter, keyword: selectedKeywords.join(","), lastImage: limit } as KeywordFilterOptions)
        }
    }, [selectedKeywords])



    const minAutoCompleteLength = propMinACL ?? 3

    const keywordOptions = useMemo(
        () =>
            keywordQuery.length >= minAutoCompleteLength
                ? usage?.map(u => u.keyword).filter(
                    k => k.toLowerCase().includes(keywordQuery.toLowerCase())
                ) : [],
        [keywordQuery, usage, selectedKeywords]
    );

    return <>
        <div style={{ flex: "1", display: 'flex', flexDirection: 'column', overflowY: "hidden" }}>
            {children && mode !== "graph" ? children : mode === "table"
                ? <TableContainer component={Paper} sx={{ width: '100%', flex: "1" }} ref={tableRef}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: 48 }}></TableCell>
                            <TableCell sx={{ width: '100%' }}>{keywordColumnOverride ?? "Keyword"}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{StatisticOptions[statistic]?.shortName ?? statistic}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>First use</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>Last use</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}></TableCell>
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
                                    <div style={{ background: StatisticOptions[statistic]?.color, width: `${(StatisticOptions[statistic]?.getStat?.(a) ?? 0) * 100 / max}%`, height: `${rowHeight}px` }} />
                                    <div style={{ position: "absolute", left: "8px", top: "0", height: `${rowHeight}px`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        {renderKeywordRow ? renderKeywordRow(a) : a.keyword}
                                    </div>
                                </div></TableCell>
                                <TableCell>{StatisticOptions[statistic]?.formatStat?.(a)}</TableCell>
                                <TableCell>{new Date(a.minTs).toLocaleDateString(undefined, { year: '2-digit', month: '2-digit', day: '2-digit' })}</TableCell>
                                <TableCell>{new Date(a.maxTs).toLocaleDateString(undefined, { year: '2-digit', month: '2-digit', day: '2-digit' })}</TableCell>
                                <TableCell><IconButton onClick={() => {
                                    setSelectedUsage(a)
                                    setUsageOpen(true)
                                }}><ChevronRight /></IconButton></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </TableContainer> : selectedKeywords.length === 0 ? <div style={{ display: 'flex', flex: "1", flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: "10px" }}>
                    <ChamomileLogo hideWords />
                    <div>Select a {keywordColumnOverride?.toLowerCase() ?? "keyword"}!</div>
                </div> : loading && !data ? <div style={{ display: 'flex', flex: "1", flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: "10px" }}>
                    <CircularProgress />
                    <div>Fetching usage data</div>
                </div> : <DatedUsageGraph
                    graphMode={graphMode}
                    data={data} setImageView={setImageView}
                    renderKeywordRow={renderKeywordRow}
                />}
        </div>

        <KeywordUsageModal
            open={usageOpen} setOpen={setUsageOpen} data={selectedUsage}
            renderImageTile={renderImageTile ? (k) => renderImageTile?.(k, setImageView) : undefined} renderKeywordRow={renderKeywordRow}
            getSampleImageId={getSampleImageId} suppressDeleted={suppressDeleted}
        />

        {(!hideGraph || !hidePagination) && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: "10px" }}>

            <div style={{ display: "flex", gap: "10px", marginLeft: "10px", alignItems: 'center', flex: "1" }}>
                {!hideGraph && <IconButton disabled={usage?.length === 0} onClick={() => {
                    if (mode === "table") {
                        if (usage?.length === 1) setSelectedKeywords([usage[0].keyword])
                    }
                    setMode(mode === "table" ? "graph" : "table")
                }}>
                    {mode === "table" ? <Timeline /> : <TableView />}
                </IconButton>}
                {mode === "table" && (
                    renderCount ? renderCount(usage.length) :
                        <div style={{ opacity: ".7", fontSize: ".9em" }}> {usage.length} {keywordColumnOverride ?? "Keyword"}s</div>
                )}
                {mode === "graph" && <>

                    {(usage?.length > 1 ? <Autocomplete
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
                                    style={{ backgroundColor: GRAPH_DARK_COLORS[index % GRAPH_COLORS.length], color: 'white' }}
                                    label={`${option}`}
                                    {...getTagProps({ index })}
                                />
                            ))
                        }
                        disabled={usage.length === 0}
                    /> : usage.length === 1 ? <div style={{ flex: 1 }}>{usage[0].keyword}</div> : <div style={{ flex: 1 }} />)}

                    <ToggleButtonGroup
                        value={mode}
                        exclusive
                        onChange={(_, val) => { setGraphMode(val) }}
                        aria-label="text alignment"
                        size="small"
                    >
                        <Tooltip title="Cumulative">
                            <ToggleButton value="CUMULATIVE" selected={graphMode === "CUMULATIVE"}>
                                <SignalCellularAlt />
                            </ToggleButton>
                        </Tooltip>
                        <Tooltip title="Daily counts">
                            <ToggleButton value="DAILY" >
                                <BarChart />
                            </ToggleButton>
                        </Tooltip>
                    </ToggleButtonGroup>

                </>}
            </div>

            {mode === "table" && !hidePagination && <div style={{ display: 'flex', gap: "5px", alignItems: 'center' }}>
                <IconButton onClick={() => setPage(0)} disabled={page === 0}><FirstPage /></IconButton>
                <IconButton onClick={() => prevPage()} disabled={page === 0}><ChevronLeft /></IconButton>
                <div>{page + 1}</div>
                <IconButton onClick={() => nextPage()} disabled={page === pages - 1}> <ChevronRight /></IconButton>
                <IconButton onClick={() => setPage(pages - 1)} disabled={page === pages - 1}><LastPage /></IconButton>
            </div>}
        </div>}

        <ImageModalFromId image={imageView} open={!!imageView && imageView > 0} setOpen={() => setImageView(-1)} />
    </>

}
