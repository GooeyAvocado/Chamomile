import { Button, Card, Divider, FormControl, IconButton, MenuItem, Select, TextField, Tooltip } from "@mui/material";
import { Grid } from "../../../model/Grid";
import PromptBuilder from "../prompt/PromptBuilder";
import { Add, Close, CompareArrows, OpenWith, Remove, Window } from "@mui/icons-material";
import { GridType, GridTypes } from "./GridTypes";
import SamplerSelector from "../prompt/SamplerSelector";
import SchedulerSelector from "../prompt/SchedulerSelector";
import CheckpointSelector from "../checkpoint/CheckpointSelector";
import TabbedModal from "../modals/TabbedModal/TabbedModal";
import TabbedModalTabContent from "../modals/TabbedModal/TabbedModalTabContent";
import TabbedModalActions from "../modals/TabbedModal/TabbedModalActions";
import TabbedModalTitle from "../modals/TabbedModal/TabbedModalTitle";
import LoraSelector from "../lora/LoraSelector";
import LoraBrowserModal from "../lora/LoraBrowserModal";
import { useMemo, useState } from "react";
import CheckpointBrowserModal from "../checkpoint/CheckpointBrowserModal";
import { GeneratedImage } from "../../../model/GeneratedImage";

export default function GridEditor({ grid, setGrid, open, setOpen, onOk, loading, generated, duplicate, imageMap, readOnly }: {
    open: boolean,
    setOpen: (val: boolean) => void
    grid: Grid
    setGrid: (val: Grid) => void,
    onOk: () => void
    loading?: boolean
    generated?: boolean
    readOnly?: boolean
    imageMap?: GeneratedImage[][]
    duplicate?: boolean
}) {

    const editing = (grid.id ?? 0) > 0

    const rowHasImage = useMemo(() => {
        if (!imageMap) return []
        return imageMap.map(row => row.some(img => img != null));
    }, [imageMap]);

    const columnHasImage = useMemo(() => {
        if (!imageMap) return []
        const numCols = imageMap[0]?.length ?? 0;

        return Array.from({ length: numCols }, (_, colIndex) =>
            imageMap.some(row => row[colIndex] != null)
        );
    }, [imageMap]);

    const flipAxes = () => {
        setGrid({ ...grid, xValMode: grid.yValMode, xVals: grid.yVals, yValMode: grid.xValMode, yVals: grid.xVals })
    }

    return <TabbedModal open={open} setOpen={() => { }} maxWidth="md" fullWidth tabContentStyle={{ display: "flex", flexDirection: 'column', gap: "10px", overflowY: "auto", maxHeight: "75vh", minHeight: "50vh" }}>
        <TabbedModalTitle>{duplicate ? "Duplicating existing grid" : editing ? "Editing Grid" : "Create a new Grid"}</TabbedModalTitle>
        <TabbedModalTabContent label="Metadata">
            <TextField
                label="Name" value={grid.name} fullWidth style={{ marginTop: "5px" }}
                onChange={(e) => setGrid({ ...grid, name: e.target.value })}
            />
            <TextField fullWidth
                label="Notes" value={grid.notes} multiline minRows={3}
                onChange={(e) => setGrid({ ...grid, notes: e.target.value })}
            />
            <Card elevation={3} style={{ flexShrink: 0, padding: '20px' }}>
                <PromptBuilder
                    alwaysExpand fullHeight noBrew prompt={{ ...grid, positivePrompt: grid.prompt, variables: {} }} forceShowSeed
                    setPrompt={(p) => setGrid({ ...grid, ...p, prompt: p.positivePrompt })} preview={(generated && !duplicate) || loading}
                />
            </Card>
        </TabbedModalTabContent>
        <TabbedModalTabContent label="Columns and Rows" style={{ display: 'flex', gap: "10px" }}>
            <div style={{ flex: "1" }}>
                <GridValsEditor axis="X" mode={grid.xValMode} vals={grid.xVals} editing={generated && !duplicate}
                    readOnly={readOnly || !!loading}
                    setVals={a => setGrid({ ...grid, xVals: a })}
                    setMode={a => setGrid({ ...grid, xValMode: a })}
                    axisImagePresence={columnHasImage}
                />
            </div>
            <div style={{ alignSelf: 'center' }}>
                <Tooltip title="Flip Axes">
                    <IconButton onClick={() => flipAxes()} disabled={(generated && !duplicate) || !!loading || readOnly}>
                        <CompareArrows />
                    </IconButton>
                </Tooltip>
            </div>
            <div style={{ flex: "1" }}>
                <GridValsEditor axis="Y" mode={grid.yValMode} vals={grid.yVals} editing={(generated && !duplicate)}
                    readOnly={readOnly || !!loading}
                    setVals={a => setGrid({ ...grid, yVals: a })}
                    setMode={a => setGrid({ ...grid, yValMode: a })}
                    axisImagePresence={rowHasImage}
                />
            </div>
        </TabbedModalTabContent>
        <TabbedModalActions>
            <div style={{ display: 'flex', justifyContent: "space-between", width: "100%", alignItems: 'center' }}>
                <div style={{ marginLeft: "10px", fontSize: ".8em", opacity: ".8" }}>
                    {grid?.xVals?.length} x {grid?.yVals?.length} ({grid?.xVals?.length * grid?.yVals?.length} images)
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <Button disabled={loading} onClick={() => setOpen(false)}>Cancel</Button>
                    <Button disabled={loading} onClick={onOk}>OK</Button>
                </div>
            </div>
        </TabbedModalActions>

    </TabbedModal>

}

function GridValsEditor({
    mode, axis, vals, setVals, setMode, editing, axisImagePresence, readOnly
}: {
    mode: string,
    axis: "X" | "Y"
    vals: string[]
    setMode: (val: string) => void
    setVals: (vals: string[]) => void
    editing?: boolean
    readOnly?: boolean
    axisImagePresence: boolean[]
}) {

    const [multiSelectOpen, setMultiSelectOpen] = useState(false);

    function removeFromArray<T>(array: T[], index: number) {
        return [...array.slice(0, index), ...array.slice(index + 1)]
    }

    function updateInArray<T>(array: T[], index: number, val: T) {
        return array.map((a, i) => i === index ? val : a)
    }

    function addToArray<T>(array: T[], val: T) {
        return [...array, val]
    }

    const type = GridTypes.find(a => a.code === mode)

    return <Card style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px" }}>
        <FormControl fullWidth >
            <Select
                disabled={editing}
                value={mode ?? ""}
                onChange={(e) => setMode(e.target.value)}
            >
                {GridTypes.filter(a => !a.group).map(a =>
                    <MenuItem key={axis + a.code} value={a.code} onClick={() => setMode(a.code)}>
                        <GridTypeMenuItemBody type={a} />
                    </MenuItem>)}

                {/* We cannot use a map because for some reason <></> breaks the onChange() detection */}
                {/* There's probably a better way to do this but I am too lazy to figure it out */}

                <Divider />
                {GridTypes.filter(a => a.group === "Prompt").map(a =>
                    <MenuItem key={axis + a.code} value={a.code} onClick={() => setMode(a.code)}>
                        <GridTypeMenuItemBody type={a} />
                    </MenuItem>)}

                <Divider />
                {GridTypes.filter(a => a.group === "Models").map(a =>
                    <MenuItem key={axis + a.code} value={a.code} onClick={() => setMode(a.code)}>
                        <GridTypeMenuItemBody type={a} />
                    </MenuItem>)}

                <Divider />
                {GridTypes.filter(a => a.group === "Tuning").map(a =>
                    <MenuItem key={axis + a.code} value={a.code} onClick={() => setMode(a.code)}>
                        <GridTypeMenuItemBody type={a} />
                    </MenuItem>)}
            </Select>
        </FormControl>

        <hr style={{ width: "100%" }} />

        <div style={{ height: "50vh", overflowY: "auto", display: 'flex', flexDirection: "column", gap: "10px" }}>
            {type && type.type !== "none" ? <>

                {vals.map((a, i) => <div style={{ display: 'flex', gap: "10px", alignItems: 'center' }}>
                    <IconButton onClick={() => setVals(removeFromArray(vals, i))} disabled={
                        //Remove should be disabled if:
                        readOnly || //We're read only OR
                        (editing && //We're editing AND
                            (
                                i < vals.length - 1 || //This is not the last item in the list
                                axisImagePresence[i] //There are images present on this axis
                            ))
                    }><Remove /></IconButton>
                    {
                        ["float", "int", "string", "multiline"].includes(type.type) ? <TextField fullWidth
                            value={a} type={["float", "int"].includes(type.type) ? "number" : undefined}
                            multiline={type.type === "multiline"}
                            slotProps={{
                                htmlInput: {
                                    step: type.type === "float" ? 0.1 : type.type === "int" ? 1 : undefined,
                                    min: ["float", "int"].includes(type.type) ? 0 : undefined
                                }
                            }} disabled={readOnly || editing && axisImagePresence[i]}
                            onChange={(e) => setVals(updateInArray(vals, i, e.target.value))}
                        /> : type.type === "sampler" ? <SamplerSelector sampler={a} setSampler={a => setVals(updateInArray(vals, i, a))} disabled={readOnly || editing && axisImagePresence[i]} />
                            : type.type === "scheduler" ? <SchedulerSelector scheduler={a} setScheduler={a => setVals(updateInArray(vals, i, a))} disabled={readOnly || editing && axisImagePresence[i]} />
                                : type.type === "model" ? <CheckpointSelector model={a} setModel={a => setVals(updateInArray(vals, i, a.id))} disabled={readOnly || editing && axisImagePresence[i]} style={{ width: "100%" }} />
                                    : type.type === "lora" ? <div style={{ width: "100%" }}>

                                        <div style={{ display: 'flex', gap: "10px", alignItems: 'center', width: "100%" }}>
                                            <LoraSelector lora={a.split(":")[1] ?? ""} setLora={lora => setVals(updateInArray(vals, i,
                                                `<lora:${lora.id}:${a.split(":")[2]?.replace(">", "") ?? "1"}>`
                                            ))} disabled={readOnly || editing && axisImagePresence[i]} style={{ flex: 1 }} />
                                            <TextField
                                                type="number" disabled={(readOnly || editing && axisImagePresence[i]) || a.length === 0} label="⚖️"
                                                value={a.split(":")[2]?.replace(">", "") ?? "1"}
                                                onChange={(e) => setVals(updateInArray(vals, i,
                                                    `<lora:${a.split(":")[1] ?? ""}:${e.target.value}>`
                                                ))}
                                                style={{ width: "50px" }}
                                                slotProps={{
                                                    inputLabel: {
                                                        shrink: true,
                                                    },
                                                    htmlInput: {
                                                        step: 0.1,
                                                        min: 0
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                        : type.type === "dimensions" ?
                                            <div style={{
                                                flex: "1", alignItems: 'center', borderRadius: "4px",
                                                border: "1px solid rgba(255,255,255, 0.23)", minWidth: "260px"
                                            }}>

                                                {/* This is necessary. If this isn't in a sub-div, the padding adds to the width and makes flex:1 not be half and half */}
                                                {/* border-box does not solve this issue either. I have no idea why, but hey, this works. So we're good */}
                                                <div style={{ display: 'flex', gap: "10px", width: "100%", height: "56px", alignItems: 'center', padding: "0 16px" }}>
                                                    <OpenWith sx={{ margin: "-7px", marginRight: "5px" }} />

                                                    {/* Width */}
                                                    <TextField type="number" disabled={readOnly || editing && axisImagePresence[i]}
                                                        value={a.split('x')[0]} onChange={(e) => setVals(updateInArray(vals, i, [e.target.value, a.split('x')[1] ?? ""].join("x")))}
                                                        placeholder="1024" fullWidth slotProps={{ htmlInput: { min: 1 }, }} variant="standard"
                                                        style={{ flex: "1", minWidth: "45px" }}
                                                        size="small"
                                                    />
                                                    <Close fontSize="inherit" />
                                                    {/* Height */}
                                                    <TextField type="number" disabled={readOnly || editing && axisImagePresence[i]}
                                                        value={a.split('x')[1] ?? ""} onChange={(e) => setVals(updateInArray(vals, i, [a.split('x')[0] ?? "", e.target.value].join("x")))}
                                                        placeholder="1024" fullWidth slotProps={{ htmlInput: { min: 1 }, }} variant="standard"
                                                        style={{ flex: "1", minWidth: "45px" }}
                                                        size="small"
                                                    />
                                                    <div>px</div>


                                                </div>
                                            </div>
                                            : <></>
                    }
                </div>)}


            </> : <div style={{ textAlign: 'center' }}>Select a type to get started</div>}
        </div>

        <hr style={{ width: "100%" }} />
        <div style={{ display: 'flex', width: "100%" }}>
            <Button
                startIcon={<Add />} style={{ flex: "1" }}
                disabled={readOnly || !type || type.type === "none"}
                onClick={() => setVals(addToArray(vals, ""))}>
                Add new {axis === "Y" ? "row" : "column"}
            </Button>
            {
                type && (type.type === "model" || type.type === "lora") &&
                <Button
                    startIcon={<Window />} style={{ flex: "1" }}
                    disabled={readOnly}
                    onClick={() => setMultiSelectOpen(true)}
                >
                    Select values
                </Button>
            }
        </div>

        {type?.type === "lora" && <LoraBrowserModal
            initialSelected={vals.filter(a => a.includes(":")).map(a => a.split(":")[1])}
            lockedSelected={vals.map((v, i) => axisImagePresence[i] ? v : undefined).filter(a => !!a && a?.includes(":")).map(a => a?.split(":")[1] ?? "")}
            multiSelect onOk={(val) => {
                setVals([...val.map(a => `<lora:${a.id}:1>`)])
                setMultiSelectOpen(false);
            }} open={multiSelectOpen} setOpen={setMultiSelectOpen}
        />}

        {type?.type === "model" && <CheckpointBrowserModal
            initialSelected={vals}
            lockedSelected={vals.map((v, i) => axisImagePresence[i] ? v : undefined).filter(a => !!a) as string[]}
            multiSelect onOk={(val) => {
                setVals([...val.map(a => a.id)])
                setMultiSelectOpen(false);
            }} open={multiSelectOpen} setOpen={setMultiSelectOpen}
        />}

    </Card>


}

function GridTypeMenuItemBody({ type }: { type: GridType }) {
    return <div style={{ display: 'flex', gap: "10px", alignItems: 'center' }}>
        {type.prefix} {type.name}
    </div>
}