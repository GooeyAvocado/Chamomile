import { useEffect, useState } from "react";
import Navbar from "../shared/navbar/Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import useApi from "../hooks/useApi";
import { Grid } from "../../model/Grid";
import { createGrid, deleteGrid, getGrid, getGrids } from "../../api/Grid";
import { Alert, InputAdornment, TextField } from "@mui/material";
import { Search } from "@mui/icons-material";
import GridTile from "../shared/grids/GridTile";
import NewGridTile from "../shared/grids/NewGridTile";
import { useSettings } from "../hooks/useSettings";
import GridEditor from "../shared/grids/GridEditor";
import { useSnackbar } from "notistack";
import AreYouSureModal from "../shared/modals/AreYouSureModal";
import GridViewer from "../shared/grids/GridViewer";
import useUserAgent from "../hooks/useUserAgent";

export default function GridsPage() {

    const { isMobile } = useUserAgent()

    const { fetch } = useApi(getGrid)
    const { fetch: refreshGrids, data: grids, loading: loadingGrids } = useApi(getGrids, true)

    const { settings } = useSettings();

    const { fetch: create, loading: createLoading } = useApi(createGrid)
    const { fetch: del } = useApi(deleteGrid)

    const [query, setQuery] = useState("")
    const [deleteAys, setDeleteAys] = useState(false)

    const location = useLocation();
    const nav = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const defaultGridState = {
        cfgScale: settings.defaults.cfg,
        height: settings.defaults.height,
        name: "New grid",
        negativePrompt: settings.defaults.negativePrompt,
        prompt: "",
        sampler: settings.defaults.sampler,
        scheduleType: settings.defaults.scheduler,
        seed: Math.floor(Math.random() * 1000000000),
        steps: settings.defaults.steps,
        width: settings.defaults.width,
        generationDurationMs: 0,
        notes: "",
        xValMode: "NON",
        xVals: [],
        yValMode: "NON",
        yVals: [],
    } as Grid

    const gridsOpen = location.pathname === "/grid/"
    const [grid, setGrid] = useState<Grid>()
    const [editorOpen, setEditorOpen] = useState(false)
    const [editorState, setEditorState] = useState<Grid>(defaultGridState)

    useEffect(() => {
        const id = Number.parseInt(location.pathname.replace("/grid/", ""));
        if (!isNaN(id)) {
            if (grid?.id !== id) {
                fetch(setGrid, undefined, id)
            }
        }
    }, [location])


    const onEditorOk = () => {
        if (editorState.xValMode === "NON" && editorState.yValMode === "NON") {
            enqueueSnackbar("Please specify at least one axis!", { variant: "error" })
            return;
        }

        if (editorState.xValMode === "NON") { editorState.xVals = [""] } else {
            if (editorState.xVals.length === 0) {
                enqueueSnackbar("Please specify at least one X axis value!", { variant: "error" })
                return;
            }
        }

        if (editorState.yValMode === "NON") { editorState.yVals = [""] } else {
            if (editorState.yVals.length === 0) {
                enqueueSnackbar("Please specify at least one Y axis value!", { variant: "error" })
                return;
            }
        }


        create((val) => {
            setGrid(val)
            nav(`/grid/${val?.id}`)
            setEditorOpen(false)
            enqueueSnackbar("Grid created!", { variant: "success" })
        }, () => {
            enqueueSnackbar("Could not create grid", { variant: "error" })
        }, editorState)

    }



    return <div style={{
        height: "100vh",
        overflow: 'hidden', display: "flex",
        flexDirection: "column", alignItems: 'center',
        margin: "0 auto"
    }}>

        {/* Header */}

        <Navbar />

        <div style={{ display: "flex", flexDirection: 'column', width: "100%", flex: 1, padding: "0px 5%", overflowY: "hidden" }}>

            {gridsOpen ? <>
                {isMobile && <Alert style={{ paddingTop: "20px" }} severity="warning" >
                    Grids aren't designed for mobile. Proceed with caution!
                </Alert>}
                <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
                    <TextField
                        value={query} onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search Grids"
                        slotProps={{
                            input: {
                                startAdornment: <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            }
                        }} style={{ flex: "1" }} />
                </div>
                <div style={{ flex: "1", overflowY: 'auto', width: "100%", marginBottom: "20px", marginTop: "20px" }}>
                    {loadingGrids ?
                        <div style={{ display: 'flex', flexDirection: 'column', height: "100%", justifyContent: 'center', alignItems: 'center' }}>
                            <img src="/brewing.gif" style={{ width: "128px", margin: "16px" }} />
                            <div>Checking the cupboard...</div>
                        </div>
                        : (grids?.filter(a => query.trim().length === 0 || (
                            a.name.toLowerCase().includes(query) || a.notes?.toLowerCase().includes(query)
                        ))?.length ?? 0) === 0 && query.length > 0 ? <div style={{ display: 'flex', flexDirection: 'column', height: "100%", justifyContent: 'center', alignItems: 'center' }}>
                            <img src="/grids.png" style={{ width: "128px", margin: "16px" }} />
                            <div>No grids found!</div>
                        </div> : <div style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(auto-fill, minmax(${'256'}px, 1fr))`,
                            gap: '20px',
                        }}>
                            {query.trim().length === 0 && <NewGridTile onClick={() => { setEditorOpen(true); setEditorState(defaultGridState); }} />}
                            {grids?.filter(a => query.trim().length === 0 || (
                                a.name.toLowerCase().includes(query) || a.notes?.toLowerCase().includes(query)
                            ))?.map(a =>
                                <GridTile key={`album-${a.id}`} grid={a} onClick={() => {
                                    setGrid(a)
                                    nav(`/grid/${a.id}`)
                                }} />
                            )}
                        </div>}
                </div>

                <GridEditor grid={editorState} setGrid={setEditorState} open={editorOpen} setOpen={setEditorOpen} onOk={onEditorOk} loading={createLoading} />

            </> : <>

                {grid && <GridViewer grid={grid} onBack={() => {
                    nav("/grid/")
                    refreshGrids();
                    setGrid(undefined)
                }}
                    setGrid={setGrid}
                    onDelete={() => { setDeleteAys(true) }}

                />}

            </>}
        </div>

        <AreYouSureModal open={deleteAys} setOpen={setDeleteAys} title="Delete this grid?" onYes={() => {
            setDeleteAys(false)
            del(() => {
                enqueueSnackbar("Grid deleted!", { variant: "success" })
                nav("/grid/")
                setGrid(undefined)
                refreshGrids()
            }, () => {
                enqueueSnackbar("Could not delete grid", { variant: "error" })
            }, grid?.id)
        }}>
            Are you sure you want to delete this grid? All images in this grid will be deleted
        </AreYouSureModal>

    </div>
}
