import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, MenuItem, Select, TextField, Tooltip } from "@mui/material";
import { Grid } from "../../../model/Grid";
import ComplexAccordion from "../complexAccordion/ComplexAccordion";
import ComplexAccordionBody from "../complexAccordion/ComplexAccordionBody";
import PromptBuilder from "../prompt/PromptBuilder";
import { Add, CompareArrows, Remove } from "@mui/icons-material";
import { GridTypes } from "./GridTypes";
import SamplerSelector from "../prompt/SamplerSelector";
import SchedulerSelector from "../prompt/SchedulerSelector";

export default function GridEditor({ grid, setGrid, open, setOpen, onOk, loading, generated }: {
    open: boolean,
    setOpen: (val: boolean) => void
    grid: Grid
    setGrid: (val: Grid) => void,
    onOk: () => void
    loading?: boolean
    generated?: boolean
}) {

    const editing = (grid.id ?? 0) > 0


    const flipAxes = () => {
        setGrid({ ...grid, xValMode: grid.yValMode, xVals: grid.yVals, yValMode: grid.xValMode, yVals: grid.xVals })
    }

    return <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? "Editing Grid" : "Create a new Grid"}</DialogTitle>
        <DialogContent style={{ display: "flex", flexDirection: 'column', gap: "10px", overflowY: "unset" }}>
            <TextField
                label="Name" value={grid.name} fullWidth
                onChange={(e) => setGrid({ ...grid, name: e.target.value })}
            />
            <TextField fullWidth
                label="Notes" value={grid.notes} multiline minRows={3}
                onChange={(e) => setGrid({ ...grid, notes: e.target.value })}
            />
            <ComplexAccordion title="Prompt">
                <ComplexAccordionBody>
                    <PromptBuilder
                        alwaysExpand fullHeight noBrew prompt={{ ...grid, positivePrompt: grid.prompt, variables: {} }}
                        setPrompt={(p) => setGrid({ ...grid, ...p, prompt: p.positivePrompt })} preview={generated || loading}
                    />
                </ComplexAccordionBody>
            </ComplexAccordion>
            <ComplexAccordion title="Values">
                <ComplexAccordionBody style={{ display: 'flex', gap: "10px" }}>
                    <div style={{ flex: "1" }}>
                        <GridValsEditor axis="X" mode={grid.xValMode} vals={grid.xVals} disabled={generated || !!loading}
                            setVals={a => setGrid({ ...grid, xVals: a })}
                            setMode={a => setGrid({ ...grid, xValMode: a })}
                        />
                    </div>
                    <div style={{ alignSelf: 'center' }}>
                        <Tooltip title="Flip Axes">
                            <IconButton onClick={() => flipAxes()} disabled={generated}>
                                <CompareArrows />
                            </IconButton>
                        </Tooltip>

                    </div>
                    <div style={{ flex: "1" }}>
                        <GridValsEditor axis="Y" mode={grid.yValMode} vals={grid.yVals} disabled={generated || !!loading}
                            setVals={a => setGrid({ ...grid, yVals: a })}
                            setMode={a => setGrid({ ...grid, yValMode: a })}
                        />
                    </div>
                </ComplexAccordionBody>
            </ComplexAccordion>
        </DialogContent>
        <DialogActions>
            <Button disabled={loading} onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={loading} onClick={onOk}>OK</Button>
        </DialogActions>

    </Dialog>

}

function GridValsEditor({
    mode, axis, vals, setVals, setMode, disabled
}: {
    mode: string,
    axis: "X" | "Y"
    vals: string[]
    setMode: (val: string) => void
    setVals: (vals: string[]) => void
    disabled: boolean
}) {

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

    return <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <FormControl fullWidth >
            <Select
                disabled={disabled}
                value={mode ?? ""}
                onChange={(e) => setMode(e.target.value)}
            >
                {GridTypes?.map(a => <MenuItem key={axis + a.code} value={a.code}>{a.name}</MenuItem>)}
            </Select>
        </FormControl>

        {type && type.type !== "none" && <>
            {/* <hr style={{ width: "100%" }} /> */}
            {vals.map((a, i) => <div style={{ display: 'flex', gap: "10px", alignItems: 'center' }}>
                <IconButton onClick={() => setVals(removeFromArray(vals, i))} disabled={disabled}><Remove /></IconButton>
                {
                    ["float", "int", "string"].includes(type.type) ? <TextField fullWidth
                        value={a} type={["float", "int"].includes(type.type) ? "number" : undefined}
                        slotProps={{
                            htmlInput: {
                                step: type.type === "float" ? 0.1 : type.type === "int" ? 1 : undefined,
                                min: ["float", "int"].includes(type.type) ? 0 : undefined
                            }
                        }} disabled={disabled}
                        onChange={(e) => setVals(updateInArray(vals, i, e.target.value))}
                    /> : type.type === "sampler" ? <SamplerSelector sampler={a} setSampler={a => setVals(updateInArray(vals, i, a))} disabled={disabled} />
                        : type.type === "scheduler" ? <SchedulerSelector scheduler={a} setScheduler={a => setVals(updateInArray(vals, i, a))} disabled={disabled} /> : <></>
                }
            </div>)}
            <Button style={{ marginTop: "10px" }} startIcon={<Add />} disabled={disabled} onClick={() => setVals(addToArray(vals, ""))}>Add new {axis === "X" ? "row" : "column"}</Button>
        </>}
    </div>


}