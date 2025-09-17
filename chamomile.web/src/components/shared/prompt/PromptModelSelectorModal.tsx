import { Alert, AlertTitle, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material"
import { usePrompt } from "../../hooks/usePrompt"
import ModelSelector from "../model/ModelSelector";
import useApi from "../../hooks/useApi";
import { currentModel, setModel } from "../../../api/Model";
import { Model } from "../../../model/Model";
import { useEffect, useState } from "react";
import { Add, Close, Schedule } from "@mui/icons-material";
import LoraCard from "../lora/LoraCard";
import ModelCard from "../model/ModelCard";
import LoraSelector from "../lora/LoraSelector";
import { useSnackbar } from "notistack";
import { ModelRequest } from "../../../model/ModelRequest";
import { Prompt } from "../../../model/Prompt";
import { useLoras } from "../../hooks/useLoras";
import { useModels } from "../../hooks/useModels";
import { usePingPong } from "../../hooks/usePingPong";
import { getModelSequence, setModelSequence } from "../../../api/Images";
import ModelSequenceEditor from "../model/ModelSequenceEditor";

export default function PromptModelSelectorModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void
    noBrew?: boolean
    prompt?: Prompt,
    setPrompt?: (val: Prompt) => void
}) {

    const { open, setOpen, noBrew, prompt: promptOverride, setPrompt: setPromptOverride } = props

    const [addOpen, setAddOpen] = useState(false)

    const { prompt: globalPrompt, setPrompt: setGlobalPrompt } = usePrompt();
    const currentModelApi = useApi(currentModel)
    const currentSequenceApi = useApi(getModelSequence)
    const changeModelSequenceApi = useApi(setModelSequence)
    const [sequenceEditorOpen, setSequenceEditorOpen] = useState(false);
    const changeModelApi = useApi(setModel)
    const { enqueueSnackbar } = useSnackbar();
    const { pong } = usePingPong();

    const prompt = promptOverride ?? globalPrompt;
    const setPrompt = setPromptOverride ?? setGlobalPrompt

    useEffect(() => {
        if (open) {
            if (!noBrew) {
                currentModelApi.fetch();
                currentSequenceApi.fetch();
            }
        }
    }, [open])

    const usedLoras = () => {
        const loraPattern = /<lora:([^>]*):\d*\.*\d*>/g;
        const matches = [...prompt.positivePrompt.matchAll(loraPattern)];
        return matches.map(match => match[1])
    }

    const additionalModels = (currentSequenceApi.data ?? []).filter(m => m.modelTitle !== currentModelApi.data?.model);

    const onChangeModel = (val: Model) => {
        changeModelApi.fetch(() => {
            enqueueSnackbar("Model changed!", { variant: 'success' })
            currentModelApi.fetch()
            if ((currentSequenceApi.data?.length ?? 0) > 0 && !currentSequenceApi.data?.find(a => a.modelTitle === val.title)) {
                //We have a sequence and we've just changed the model to one that is not in the sequence, so we should clear the sequence
                changeModelSequenceApi.fetch(() => {
                    enqueueSnackbar("Model sequence cleared!", { variant: 'success' })
                    currentSequenceApi.fetch();
                }, () => {
                    enqueueSnackbar("Model sequence could not be cleared", { variant: 'error' })
                }, [])
                setOpen(false);
            }
        }, () => {
            enqueueSnackbar("Model could not be changed", { variant: 'error' })
        }, { model: val.title } as ModelRequest)
    }

    const addLora = (alias: string) => {
        setPrompt({ ...prompt, positivePrompt: prompt.positivePrompt.trimEnd() + ` <lora:${alias}:1>` });
    }

    const removeLora = (alias: string) => {
        setPrompt({ ...prompt, positivePrompt: prompt.positivePrompt.replace(new RegExp(`<lora:${alias}:\\d*\\.*\\d*>`), "") });
    }

    return <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='sm'>

        <DialogTitle>Models</DialogTitle>

        <DialogContent style={{ display: 'flex', flexDirection: 'column', height: '75vh' }}>
            {!noBrew && pong?.SD
                ? <>
                    <Alert severity="warning" style={{ marginBottom: '10px', fontSize: '.7em' }}>
                        <AlertTitle style={{ fontSize: "1.2em" }}>Changing your primary model will affect all pending images</AlertTitle>
                        Be careful if executing this while there's images brewing!
                    </Alert>
                    <div style={{ marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <ModelCard modelTitle={currentModelApi.data?.model} />
                        {additionalModels.map(m => <ModelCard key={m.modelTitle} modelTitle={m.modelTitle} />)}
                    </div>

                    <div style={{ display: 'flex', gap: "10px", alignItems: 'center' }}>
                        <ModelSelector
                            model={currentModelApi.data?.model} setModel={onChangeModel}
                            disabled={changeModelApi.loading} loading={changeModelApi.loading}
                            style={{ marginTop: '5px', marginBottom: '10px', flex: '1' }}
                        />
                        <Tooltip title="Change the model sequence" style={{ marginTop: "-5px" }}><IconButton
                            disabled={currentModelApi.loading || currentSequenceApi.loading} onClick={() => {
                                setSequenceEditorOpen(true);
                            }}><Schedule /></IconButton></Tooltip>
                    </div>

                    <ModelSequenceEditor
                        open={sequenceEditorOpen}
                        setOpen={setSequenceEditorOpen}
                        currentModel={currentModelApi.data?.model ?? ""}
                        sequence={currentSequenceApi.data}
                        onOk={(val) => {
                            changeModelSequenceApi.fetch(() => {
                                setSequenceEditorOpen(false);
                                enqueueSnackbar("Model sequence changed!", { variant: 'success' })
                                currentSequenceApi.fetch();
                            }, () => {
                                enqueueSnackbar("Model sequence could not be changed", { variant: 'error' })
                            }, val)
                        }}

                    />



                </>
                : !pong?.SD ? <Alert severity="warning">
                    <AlertTitle>Stable diffusion is unavailable</AlertTitle>
                    You cannot change the current model because there is no current model. However, you can still set LoRAs for this prompt that you're building

                </Alert> : <></>
            }

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: "100%" }}>
                <div><b>Loras</b></div>
                <Tooltip title={addOpen ? 'Cancel' : 'Add a LoRA'}><IconButton onClick={() => setAddOpen(!addOpen)}><Add sx={{ rotate: addOpen ? '45deg' : '' }} /></IconButton></Tooltip>
            </div>

            {addOpen && <>
                <LoraSelector lora="" setLora={(e) => {
                    addLora(e.alias)
                    setAddOpen(false)
                }} />
            </>}
            <hr style={{ width: "100%" }} />

            <div style={{ flex: '1', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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