import { Prompt } from "../../../model/Prompt"
import { Button, ButtonGroup, Card, CardActionArea, Dialog, DialogActions, DialogContent, Tooltip } from "@mui/material";
import { AcUnit, Delete, DirectionsRun, OpenWith, ReceiptLong, ThumbDown, Tune, Whatshot, Window } from "@mui/icons-material";
import { imageUrl } from "../../../api/Images";
import HighlightedPromptDiv from "./HighlightedPromptDiv";
import { promptPreview } from "../Utils";
import { Progress } from "../../../model/Automatic1111/Progress";

export default function PromptOrderedModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void
    jobId: number
    prompt?: Prompt
    onCancel: (id: number) => void,
    onRush?: (id: number) => void,
    onDelay?: (id: number) => void,
    onViewImage?: (id: number) => void
    progress?: Progress
}) {

    const { open, setOpen, jobId, prompt, onCancel, onRush, onDelay, onViewImage, progress } = props;
    const orderData = prompt?.orderData

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


    return <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
        <DialogContent style={{ maxHeight: "65vh", display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ width: "128px", fontSize: ".8em" }}>
                    <div style={{
                        display: 'flex', gap: '5px', alignItems: "center", marginBottom: '10px',
                        fontSize: "1.2em"
                    }}><b style={{ display: 'flex', gap: "5px", alignItems: 'center' }}>{(prompt?.id ?? 0) < 0 && <Tooltip title="This order was rushed to the front of the queue"><Whatshot /></Tooltip>}Order {Math.abs(prompt?.id ?? 0).toLocaleString()}</b></div>

                    {progress ? <Card style={{ width: "128px", height: '128px', margin: "0px auto 5px auto" }}>
                        <img
                            src={progress.current_image ? "data:image/png;base64," + progress?.current_image : '/outline.png'}
                            style={{ width: '128px', height: '128px', objectFit: 'cover', objectPosition: 'center top' }}
                        />
                    </Card>
                        : <Card style={{ width: "128px", height: '128px', margin: "0px auto 5px auto" }}><CardActionArea onClick={orderData ? () => { onViewImage?.(orderData.sample ?? 0) } : undefined}>

                            <img
                                key={orderData?.sample}
                                src={orderData?.sample && orderData?.sample > 0 ? imageUrl(orderData.sample) : "/outlinepadded.png"}
                                style={{ width: '128px', height: '128px', objectFit: 'cover', objectPosition: 'center top' }}
                            />
                        </CardActionArea></Card>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ fontSize: ".7em", textAlign: "center" }}>Based on {basedOn()}</div>
                        <div style={{ display: 'flex', gap: "10px", alignItems: 'center' }}>
                            <Tooltip title="Dimensions"><OpenWith /></Tooltip> {prompt?.width} x {prompt?.height}
                        </div>
                        <div style={{ display: 'flex', gap: "10px", alignItems: 'center' }}>
                            <Tooltip title="Sampler"><Window /></Tooltip> {prompt?.sampler}
                        </div>
                        <div style={{ display: 'flex', gap: "20px", alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: "10px", alignItems: 'center' }}><Tooltip title="Steps"><DirectionsRun /></Tooltip> {prompt?.steps}</div>
                            <div style={{ display: 'flex', gap: "10px", alignItems: 'center' }}><Tooltip title="CFG Scale"><Tune /></Tooltip> {prompt?.cfgScale}</div>
                        </div>
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{
                        display: 'flex', gap: '5px', alignItems: "center", fontSize: ".8em", marginBottom: '10px'
                    }}> <ReceiptLong fontSize="small" /> Positive Prompt</div>
                    <HighlightedPromptDiv
                        prompt={promptPreview(prompt ?? { positivePrompt: "" } as Prompt, prompt?.variables ?? {}, [])}
                        style={{
                            flex: "1",
                            fontSize: ".7em", fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap', wordWrap: 'break-word',
                            marginBottom: '15px', maxHeight: '192px', overflowY: 'auto',
                            padding: '10px', backgroundColor: "rgba(0,0,0,0.25", borderRadius: "10px",
                        }}
                    />
                    {prompt?.negativePrompt && prompt.negativePrompt.trim().length > 0 && <div>
                        <div style={{
                            display: 'flex', gap: '5px', alignItems: "center", fontSize: ".8em", marginBottom: '10px'
                        }}> <ThumbDown fontSize="small" /> Negative Prompt</div>
                        <div style={{
                            flex: "1",
                            fontSize: ".7em", fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap', wordWrap: 'break-word',
                            maxHeight: '192px', overflowY: 'auto',
                            padding: '10px', backgroundColor: "rgba(0,0,0,0.25", borderRadius: "10px"
                        }}>
                            {prompt.negativePrompt}
                        </div>
                    </div>}
                </div>
            </div>

        </DialogContent>

        <DialogActions>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', marginLeft: "16px", marginRight: "16px", width: "100%" }}>
                <ButtonGroup>
                    <Tooltip title="This order can be worked on last">
                        <Button onClick={() => {
                            onDelay?.(jobId);
                            setOpen(false);
                        }} startIcon={<AcUnit />} disabled={!onDelay}>Delay</Button>
                    </Tooltip>
                    <Tooltip title="This order should be worked on ASAP">
                        <Button onClick={() => {
                            onRush?.(jobId);
                            setOpen(false);
                        }} startIcon={<Whatshot />} disabled={!onRush}>Rush</Button>
                    </Tooltip>
                </ButtonGroup>
                <Button onClick={() => {
                    onCancel(jobId);
                    setOpen(false);
                }} variant="outlined" color="error" startIcon={<Delete />}>Cancel Order</Button>
            </div>
        </DialogActions>

    </Dialog>

}