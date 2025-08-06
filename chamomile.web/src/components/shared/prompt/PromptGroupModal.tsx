import { useState } from "react"
import { Prompt } from "../../../model/Prompt"
import { Button, Card, CardActionArea, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material";
import { Cancel, DirectionsRun, EditNote, Height, Numbers, Tune } from "@mui/icons-material";
import PromptEditorModal from "./PromptEditorModal";
import { imageUrl } from "../../../api/Images";

export default function PromptGroupModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void
    prompts: Prompt[]
    onCancel: (id: number) => void,
    onCancelAll: () => void
    onViewImage?: (id: number) => void
}) {

    const { open, setOpen, prompts, onCancel, onCancelAll, onViewImage } = props;
    const [internalPrompt, setInternalPrompt] = useState(undefined as Prompt | undefined)
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
            default: return ""
        }
    }


    return <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>{prompts.length} Orders</DialogTitle>
        <DialogContent style={{ maxHeight: "65vh", display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: "flex", gap: "10px" }}>
                {orderData?.sample && orderData.sample > 0 && <div style={{ width: "128px", fontSize: ".8em" }}>
                    <Card style={{ width: "128px", height: '128px', margin: "0px auto 5px auto" }}><CardActionArea onClick={() => { onViewImage?.(orderData.sample ?? 0) }}>
                        <img
                            key={orderData?.sample}
                            src={imageUrl(orderData.sample)}
                            style={{ width: '100%', height: '128px', objectFit: 'contain', objectPosition: 'center top' }}
                        />
                    </CardActionArea></Card>
                    Based on {basedOn()}.
                </div>}
                <div style={{
                    flex: "1",
                    fontSize: ".7em", fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap', wordWrap: 'break-word',
                    marginBottom: '20px', maxHeight: '192px', overflowY: 'auto'
                }}>{
                        prompts[0].positivePrompt
                    }</div>

            </div>

            <hr style={{ width: "100%" }} />
            <div style={{ flex: '1', overflowY: 'auto', fontFamily: 'monospace', marginTop: "10px", marginBottom: '10px' }}>
                <table style={{ textAlign: 'center', margin: 'auto' }}>
                    <thead style={{ fontWeight: 'bold', textAlign: 'center' }}><tr>
                        <td></td>
                        <td width={"40px"}>
                            <Tooltip title="Job ID"><Numbers /></Tooltip>
                        </td>
                        <td width={"70px"}>
                            <Tooltip title="Width"><Height sx={{ transform: 'rotate(90deg)' }} /></Tooltip>
                        </td>
                        <td width={"70px"}>
                            <Tooltip title="Height"><Height /></Tooltip>
                        </td>
                        <td width={"50px"}>
                            <Tooltip title="Steps"><DirectionsRun /></Tooltip>
                        </td>
                        <td width={"50px"}>
                            <Tooltip title="CFG Scale"><Tune /></Tooltip>
                        </td>
                    </tr></thead>
                    <tbody>
                        {prompts.map(a => <tr key={a.id}>
                            <td style={{ display: 'flex', width: '100px' }}>
                                <Tooltip title="Cancel this order">
                                    <IconButton onClick={() => onCancel(a.id)}>
                                        <Cancel />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="View this order">
                                    <IconButton onClick={() => setInternalPrompt(a)}>
                                        <EditNote />
                                    </IconButton>
                                </Tooltip>
                            </td>
                            <td>{a.id}</td>
                            <td>{a.width}px</td>
                            <td>{a.height}px</td>
                            <td>{a.steps}</td>
                            <td>{a.cfgScale}</td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
            <hr style={{ width: "100%" }} />

            <PromptEditorModal title={`Order ${internalPrompt?.id}`} open={!!internalPrompt} onOk={() => {
                onCancel(internalPrompt?.id ?? 0);
                setInternalPrompt(undefined);
            }} prompt={internalPrompt ?? {} as Prompt} setOpen={() => { setInternalPrompt(undefined) }} preview cancelable />

        </DialogContent>

        <DialogActions>
            <div style={{ textAlign: 'center', marginBottom: '30px', width: "100%" }}>
                <Button onClick={() => {
                    onCancelAll();
                    setOpen(false);
                }} variant="contained">Cancel All</Button>
            </div>
        </DialogActions>

    </Dialog>

}