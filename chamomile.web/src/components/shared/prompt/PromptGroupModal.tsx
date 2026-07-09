import { useState } from "react"
import { Prompt } from "../../../model/Prompt"
import { Button, ButtonGroup, Card, CardActionArea, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material";
import { AcUnit, Cancel, ChevronRight, Delete, DirectionsRun, Numbers, OpenWith, Tune, Whatshot } from "@mui/icons-material";
import { imageUrl } from "../../../api/Images";
import HighlightedPromptDiv from "./HighlightedPromptDiv";
import PromptOrderedModel from "./PromptOrderedModal";

export default function PromptGroupModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void
    prompts: Prompt[]
    onCancel: (id: number) => void,
    onCancelAll: () => void
    onRush: (id: number) => void,
    onRushAll: () => void
    onDelay: (id: number) => void,
    onDelayAll: () => void
    onViewImage?: (id: number) => void
}) {

    const { open, setOpen, prompts, onCancel, onCancelAll, onViewImage, onDelay, onDelayAll, onRush, onRushAll } = props;
    const [internalPrompt, setInternalPrompt] = useState(undefined as Prompt | undefined)
    const [internalPromptOpen, setInternalPromptOpen] = useState(false)
    const orderData = prompts.find(a => !!a.orderData)?.orderData;

    const basedOn = () => {
        switch (orderData?.source) {
            case "IMAGE":
                return "existing image"
            case "IMAGE_BASE":
                return "existing image base prompt"
            case "SAVED_PROMPT":
                return "saved recipe"
            case "PROMPTBOX":
                return "modified recipe"
            default:
                return ""
        }
    }


    return <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth >
        <DialogTitle>{prompts.length} Orders</DialogTitle>
        <DialogContent style={{ maxHeight: "65vh", display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: "flex", gap: "10px" }}>
                {orderData?.sample && orderData.sample > 0 && <div style={{ width: "128px", fontSize: ".8em" }}>
                    <Card style={{ width: "128px", height: '128px', margin: "0px auto 5px auto" }}><CardActionArea onClick={() => { onViewImage?.(orderData.sample ?? 0) }}>
                        <img
                            key={orderData?.sample}
                            src={imageUrl(orderData.sample)}
                            style={{ width: '128px', height: '128px', objectFit: 'cover', objectPosition: 'center top' }}
                        />
                    </CardActionArea></Card>
                    <div style={{ fontSize: ".7em", textAlign: "center" }}>Based on {basedOn()}</div>
                </div>}
                <HighlightedPromptDiv
                    prompt={prompts[0].positivePrompt}
                    style={{
                        flex: "1",
                        fontSize: ".7em", fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap', wordWrap: 'break-word',
                        marginBottom: '20px', maxHeight: '192px', overflowY: 'auto',
                        padding: '0px'
                    }}
                />

            </div>

            <hr style={{ width: "100%" }} />
            <div style={{ flex: '1', overflowY: 'auto', fontFamily: 'monospace', marginTop: "10px", marginBottom: '10px' }}>
                <table style={{ textAlign: 'center', margin: 'auto' }}>
                    <thead style={{ fontWeight: 'bold', textAlign: 'center' }}><tr>
                        <td />
                        <td width={"40px"}>
                            <Tooltip title="Job ID"><Numbers /></Tooltip>
                        </td>
                        <td width={"140px"}>
                            <Tooltip title="Dimensions"><OpenWith /></Tooltip>
                        </td>
                        <td width={"50px"}>
                            <Tooltip title="Steps"><DirectionsRun /></Tooltip>
                        </td>
                        <td width={"50px"}>
                            <Tooltip title="CFG Scale"><Tune /></Tooltip>
                        </td>
                        <td></td>
                    </tr></thead>
                    <tbody>
                        {prompts.map(a => <tr key={a.id}>

                            <td>
                                <Tooltip title="Cancel this order">
                                    <IconButton onClick={() => onCancel(a.id ?? 0)}>
                                        <Cancel />
                                    </IconButton>
                                </Tooltip>
                            </td>
                            <td style={{ whiteSpace: 'nowrap', display: 'flex', gap: "10px", alignItems: 'center', marginTop: "8px" }}>{(a.id ?? 0) < 0 &&
                                <Tooltip title="This order was rushed to the front of the queue"><Whatshot /></Tooltip>
                            }{" "}{Math.abs(a.id ?? 0)}</td>
                            <td>{a.width} x {a.height}px</td>
                            <td>{a.steps}</td>
                            <td>{a.cfgScale}</td>
                            <td >
                                <Tooltip title="View this order">
                                    <IconButton onClick={() => {
                                        setInternalPrompt(a)
                                        setInternalPromptOpen(true)
                                    }}>
                                        <ChevronRight />
                                    </IconButton>
                                </Tooltip>
                            </td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
            <hr style={{ width: "100%" }} />

            <PromptOrderedModel
                jobId={internalPrompt?.id ?? 0}
                onCancel={() => {
                    onCancel(internalPrompt?.id ?? 0);
                    setInternalPromptOpen(false)
                }}
                onDelay={() => {
                    onDelay(internalPrompt?.id ?? 0);
                    setInternalPromptOpen(false)
                    setOpen(false)
                }}
                onRush={() => {
                    onRush(internalPrompt?.id ?? 0);
                    setInternalPromptOpen(false)
                    setOpen(false)
                }}
                open={internalPromptOpen}
                setOpen={setInternalPromptOpen}
                onViewImage={onViewImage}
                prompt={internalPrompt ?? {} as Prompt}
            />

        </DialogContent>

        <DialogActions>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', marginLeft: "16px", marginRight: "16px", width: "100%" }}>
                <ButtonGroup>
                    <Tooltip title="These orders can be worked on last">
                        <Button onClick={() => {
                            onDelayAll();
                            setOpen(false);
                        }} startIcon={<AcUnit />}>Delay</Button>
                    </Tooltip>
                    <Tooltip title="These orders should be worked on ASAP">
                        <Button onClick={() => {
                            onRushAll();
                            setOpen(false);
                        }} startIcon={<Whatshot />}>Rush</Button>
                    </Tooltip>
                </ButtonGroup>
                <Button onClick={() => {
                    onCancelAll();
                    setOpen(false);
                }} variant="outlined" color="error" startIcon={<Delete />}>Cancel Orders</Button>
            </div>
        </DialogActions>

    </Dialog>

}