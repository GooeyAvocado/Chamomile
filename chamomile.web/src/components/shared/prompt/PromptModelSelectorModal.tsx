import { Alert, AlertTitle, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material"
import { usePrompt } from "../../hooks/usePrompt"
import useApi from "../../hooks/useApi";
import { currentCheckpoint, setCheckpoint } from "../../../api/Checkpoint";
import { useEffect, useState } from "react";
import { Add, Close, Edit, Refresh, Schedule } from "@mui/icons-material";
import LoraCard from "../lora/LoraCard";
import LoraSelector from "../lora/LoraSelector";
import { useSnackbar } from "notistack";
import { CheckpointRequest } from "../../../model/CheckpointRequest";
import { Prompt } from "../../../model/Prompt";
import { usePingPong } from "../../hooks/usePingPong";
import { getModelSequence, setModelSequence } from "../../../api/Images";
import { useCheckpoints } from "../../hooks/useCheckpoints";
import { useLoras } from "../../hooks/useLoras";
import ModelSequenceEditor from "../checkpoint/CheckpointSequenceEditor";
import ModelCard from "../checkpoint/CheckpointCard";
import ModelSelector from "../checkpoint/CheckpointSelector";
import { Model } from "../../../model/Model";

export default function PromptModelSelectorModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void
    noBrew?: boolean
    prompt?: Prompt,
    setPrompt?: (val: Prompt) => void
}) {

    const { refresh: refreshCheckpoints, loading: checkpointsLoading } = useCheckpoints();
    const { refresh: refreshLoRAs, loading: lorasLoading } = useLoras();

    const refresh = () => {
        refreshCheckpoints(true);
        refreshLoRAs(true);
    }

    const loading = checkpointsLoading || lorasLoading

    const { open, setOpen, noBrew, prompt: promptOverride, setPrompt: setPromptOverride } = props

    const [addOpen, setAddOpen] = useState(false)
    const [checkpointEditOpen, setCheckpointEditOpen] = useState(false)

    const { prompt: globalPrompt, setPrompt: setGlobalPrompt } = usePrompt();
    const currentModelApi = useApi(currentCheckpoint)
    const currentSequenceApi = useApi(getModelSequence)
    const changeModelSequenceApi = useApi(setModelSequence)
    const [sequenceEditorOpen, setSequenceEditorOpen] = useState(false);
    const changeModelApi = useApi(setCheckpoint)
    const { enqueueSnackbar } = useSnackbar();
    const { pong } = usePingPong();

    const prompt = promptOverride ?? globalPrompt;
    const setPrompt = setPromptOverride ?? setGlobalPrompt

    useEffect(() => {
        if (open) {
            if (!noBrew) {
                currentModelApi.fetch();
                currentSequenceApi.fetch();
                setAddOpen(false);
                setCheckpointEditOpen(false)
            }
        }
    }, [open])

    const usedLoras = () => {
        const loraPattern = /<lora:([^>]*):\d*\.*\d*>/g;
        const matches = [...prompt.positivePrompt.matchAll(loraPattern)];
        return matches.map(match => match[1])
    }

    const additionalModels = (currentSequenceApi.data ?? []).filter(m => m.title !== currentModelApi.data?.checkpoint);
    const hasSequence = (currentSequenceApi.data?.length ?? 0) > 0

    const onChangeModel = (val: Model) => {
        changeModelApi.fetch(() => {
            enqueueSnackbar("Checkpoint changed!", { variant: 'success' })
            currentModelApi.fetch()
            if ((currentSequenceApi.data?.length ?? 0) > 0 && !currentSequenceApi.data?.find(a => a.title === val.id)) {
                //We have a sequence and we've just changed the model to one that is not in the sequence, so we should clear the sequence
                changeModelSequenceApi.fetch(() => {
                    enqueueSnackbar("Checkpoint sequence cleared!", { variant: 'success' })
                    currentSequenceApi.fetch();
                }, () => {
                    enqueueSnackbar("Checkpoint sequence could not be cleared", { variant: 'error' })
                }, [])
            }
            setCheckpointEditOpen(false)
        }, () => {
            enqueueSnackbar("Checkpoint could not be changed", { variant: 'error' })
        }, { checkpoint: val.id } as CheckpointRequest)
    }

    const addLora = (alias: string) => {
        setPrompt({ ...prompt, positivePrompt: prompt.positivePrompt.trimEnd() + ` <lora:${alias}:1>` });
    }

    const removeLora = (alias: string) => {
        setPrompt({ ...prompt, positivePrompt: prompt.positivePrompt.replace(new RegExp(`<lora:${alias}:\\d*\\.*\\d*>`), "") });
    }

    const checkpointLoading = currentModelApi.loading || changeModelApi.loading || currentSequenceApi.loading;

    return <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='sm'>

        <DialogTitle><div style={{ display: "flex", justifyContent: 'space-between', alignItems: 'end' }}>
            <div>Models</div>
            {pong?.SD && <Tooltip title="Refresh Checkpoints and LoRAs">
                <IconButton onClick={refresh} disabled={loading} size="small" >{
                    loading ? <CircularProgress size={24} /> : <Refresh />
                }</IconButton>
            </Tooltip>}
        </div></DialogTitle>

        <DialogContent style={{ display: 'flex', flexDirection: 'column', height: '75vh' }}>
            {!noBrew && pong?.SD
                ? <>

                    <div style={{ display: 'flex', alignItems: 'center', width: "100%" }}>
                        <div style={{ flex: "1" }}><b>Checkpoint</b></div>
                        <Tooltip title={checkpointEditOpen ? 'Cancel' : 'Change checkpoint'}><IconButton disabled={checkpointLoading} onClick={() => setCheckpointEditOpen(!checkpointEditOpen)}>{checkpointEditOpen ? <Close /> : <Edit />}</IconButton></Tooltip>
                        <Tooltip title={`${hasSequence ? "Edit" : "Set up"} checkpoint sequence`}><IconButton
                            disabled={checkpointLoading} onClick={() => {
                                setSequenceEditorOpen(true);
                            }}><Schedule /></IconButton></Tooltip>
                    </div>

                    <hr style={{ width: "100%" }} />


                    {checkpointEditOpen ? <>

                        <Alert severity="warning" style={{ marginBottom: '10px', fontSize: '.7em' }}>
                            <AlertTitle style={{ fontSize: "1.2em" }}>Changing your primary model will affect all pending images</AlertTitle>
                            Be careful if executing this while there's images brewing!
                        </Alert>

                        {hasSequence && <Alert severity="info" style={{ marginBottom: '10px', fontSize: '.7em' }}>
                            <AlertTitle style={{ fontSize: "1.2em" }}>Changing your primary model will clear your sequence</AlertTitle>
                            You can export it and import it again later on the sequence editor
                        </Alert>}

                        <div>
                            <ModelSelector
                                model={currentModelApi.data?.checkpoint} setModel={onChangeModel}
                                disabled={changeModelApi.loading} loading={changeModelApi.loading}
                                style={{ marginTop: '5px', marginBottom: '10px', flex: '1' }}
                            />
                        </div>
                    </> : currentModelApi.loading || currentSequenceApi.loading ? <>
                        <div style={{ height: "56px", padding: "10px", display: "flex", justifyContent: 'center' }}>
                            <CircularProgress size={36} />
                        </div>
                    </> : <div style={{ marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <ModelCard checkpointTitle={currentModelApi.data?.checkpoint} />
                        {additionalModels.map(m => <ModelCard key={m.title} checkpointTitle={m.title} />)}
                    </div>
                    }

                    <ModelSequenceEditor
                        open={sequenceEditorOpen}
                        setOpen={setSequenceEditorOpen}
                        currentModel={currentModelApi.data?.checkpoint ?? ""}
                        sequence={currentSequenceApi.data}
                        onOk={(val) => {
                            changeModelSequenceApi.fetch(() => {
                                setSequenceEditorOpen(false);
                                enqueueSnackbar("Checkpoint sequence changed!", { variant: 'success' })
                                currentSequenceApi.fetch();
                            }, () => {
                                enqueueSnackbar("Checkpoint sequence could not be changed", { variant: 'error' })
                            }, val)
                        }}

                    />



                </>
                : !pong?.SD ? <Alert severity="warning">
                    <AlertTitle>Stable diffusion is unavailable</AlertTitle>
                    You cannot change the current checkpoint. However, you can still set LoRAs for this prompt that you're building

                </Alert> : <></>
            }

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: "100%", marginTop: "5px" }}>
                <div><b>Loras</b></div>
                <Tooltip title={addOpen ? 'Cancel' : 'Add a LoRA'}><IconButton onClick={() => setAddOpen(!addOpen)}><Add sx={{ rotate: addOpen ? '45deg' : '' }} /></IconButton></Tooltip>
            </div>
            <hr style={{ width: "100%" }} />

            {addOpen && <>
                <LoraSelector lora="" setLora={(e) => {
                    addLora(e.id)
                    setAddOpen(false)
                }} style={{ marginTop: "10px", marginBottom: '10px' }} />
            </>}

            <div style={{ flex: '1', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: "5px" }}>
                {usedLoras().map(a => <div key={a} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <IconButton onClick={() => { removeLora(a) }}><Close /></IconButton>
                    <div style={{ flex: "1" }}><LoraCard loraAlias={a} /></div>
                </div>)}

            </div>
        </DialogContent>

        <DialogActions>
            <Button onClick={() => setOpen(false)}>OK</Button>
        </DialogActions>

    </Dialog>


}