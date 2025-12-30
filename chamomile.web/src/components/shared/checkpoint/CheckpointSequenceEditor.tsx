import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, TextField, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import CheckpointSequence from "../../../model/CheckpointSequence";
import ModelSelector from "./CheckpointSelector";
import { useCheckpoints } from "../../hooks/useCheckpoints";
import { imageUrl } from "../../../api/Images";
import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";
import IECControls from "../IECControls/IECControls";
import CheckpointBrowserModal from "./CheckpointBrowserModal";
import { Model } from "../../../model/Model";
import { useSnackbar } from "notistack";

export default function ModelSequenceEditor({ open, setOpen, onOk, sequence, currentModel, loading }: {
    open: boolean,
    setOpen: (value: boolean) => void,
    onOk: (val: CheckpointSequence[]) => void
    currentModel: string,
    sequence?: CheckpointSequence[]
    loading?: boolean
}) {


    const [internalSequence, setInternalSequence] = useState<CheckpointSequence[]>([])
    const { checkpoints: models } = useCheckpoints();
    const { enqueueSnackbar } = useSnackbar();
    const [validation, setValidation] = useState<{
        modelTitle?: string,
        chanceStay?: string,
        loadWeight?: string
    }[]>()

    const [browserOpen, setBrowserOpen] = useState(false)

    useEffect(() => {
        if (open) { initializeInternalSequence(sequence ?? []); }
    }, [open]);

    const initializeInternalSequence = (val: CheckpointSequence[]) => {
        //For compatibility:
        if (val.some(a => !!(a as any).modelTitle)) {
            val = val.map(a => ({
                chanceStay: a.chanceStay,
                loadWeight: a.loadWeight,
                title: (a as any).modelTitle ?? a.title
            }) as CheckpointSequence)
        }
        //CHECK: Does the current sequence have the current model?
        if (val?.find(a => a.title === currentModel)) {
            setInternalSequence(val); //If so then we don't need to do anything 
        } else {
            //Otherwise this really shouldn't happen, but we'll add the current model to the sequence
            setInternalSequence([{
                title: currentModel,
                chanceStay: 80,
                loadWeight: 1
            } as CheckpointSequence, ...val ?? []]);
        }
    }

    const validateAndOk = () => {
        const errors = internalSequence.map((s) => {

            const entryErrors = {} as any;
            if (s.title.length === 0) {
                entryErrors.modelTitle = "Model title is required";
            }

            //We'll make sure the user cannot make any mistakes with the numbers

            return entryErrors;

        });
        setValidation(errors)

        if (errors.some(e => Object.keys(e).length > 0)) {
            return; //If there are any errors, we don't want to continue
        }
        onOk(internalSequence);
    }

    const handleChange = (val: Model[]) => {
        const newModels = val.map(a => a.id);
        const usedModels = internalSequence?.map(a => a.title) ?? []
        //Added LoRAs are those that are ON the new one, but NOT in the old one
        const addedModels = newModels.filter(a => !usedModels.includes(a))

        //Removed LoRAs are those that are ON the old ones but NOT in the new ones
        const removedModels = usedModels.filter(a => !newModels.includes(a))

        //We do this afterwards because usedLoRAs may update during the time we execute this
        //And honestly I don't want to risk it. Besides I assume the user will not be using more than like
        //5 LoRAs so while this could probably be made more efficient the cost is negligible 

        const newSequence = [...(internalSequence ?? []).filter(a => !removedModels.includes(a.title)), ...addedModels.map(a => ({
            chanceStay: 80,
            loadWeight: 1,
            title: a
        } as CheckpointSequence))]

        if (newSequence?.find(a => a.title === currentModel)) {
            setInternalSequence(newSequence); //If so then we don't need to do anything 
        } else {
            enqueueSnackbar("Current model must be in the sequence", { variant: "warning" })
            //Otherwise this really shouldn't happen, but we'll add the current model to the sequence
            setInternalSequence([{
                title: currentModel,
                chanceStay: 80,
                loadWeight: 1
            } as CheckpointSequence, ...newSequence ?? []]);
        }

        setBrowserOpen(false)

    }

    return <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Checkpoint Sequence</DialogTitle>
        <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: "75vh" }}>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {internalSequence.map((s, index) => (
                    <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center', paddingTop: "10px" }}>

                        <IconButton disabled={loading || s.title === currentModel} onClick={() => {
                            const newSequence = [...internalSequence];
                            newSequence.splice(index, 1);
                            setInternalSequence(newSequence);
                            setValidation([])
                        }}>
                            <RemoveCircleOutline />
                        </IconButton>

                        <img
                            src={models?.find(a => a.id === s.title)?.bannerImage
                                ? imageUrl(models?.find(a => a.id === s.title)?.bannerImage ?? 0)
                                : "outline.png"}

                            style={{ width: "48px", height: "48px", objectFit: 'cover', objectPosition: 'center top', borderRadius: '5px' }}
                        />

                        <ModelSelector
                            error={!!validation?.[index]?.modelTitle}
                            helperText={validation?.[index]?.modelTitle}
                            model={s.title} setModel={(m) => {
                                const newSequence = [...internalSequence];
                                newSequence[index].title = m.id;
                                setInternalSequence(newSequence);
                                setValidation([])
                            }} style={{ flex: "1" }} disabled={s.title === currentModel || loading} />

                        <Tooltip title="This is the chance that the checkpoint will be used for the next image. Setting this too low may cause thrashing between models.">
                            <TextField
                                type="number"
                                value={s.chanceStay} disabled={loading}
                                onChange={(e) => {
                                    const newSequence = [...internalSequence];
                                    newSequence[index].chanceStay = parseFloat(e.target.value);
                                    setInternalSequence(newSequence);
                                }}
                                label="Chance to stay (%)"
                                style={{ width: '150px' }}
                                slotProps={{
                                    htmlInput: {
                                        min: 0,
                                        max: 100,
                                        step: 1
                                    },
                                    input: { endAdornment: <InputAdornment position="end">%</InputAdornment> }
                                }}
                            />
                        </Tooltip>

                        <Tooltip title="This is the weight of the checkpoint in the sequence, higher means more likely to be used.">
                            <TextField
                                error={!!validation?.[index]?.loadWeight}
                                helperText={validation?.[index]?.loadWeight}
                                type="number"
                                value={s.loadWeight} disabled={loading}
                                onChange={(e) => {
                                    const newSequence = [...internalSequence];
                                    newSequence[index].loadWeight = parseFloat(e.target.value);
                                    setInternalSequence(newSequence);
                                }}
                                label="Load Weight"
                                style={{ width: '150px' }}
                                slotProps={{
                                    htmlInput: { min: 1, step: 1 },
                                    input: { endAdornment: <InputAdornment position="end">x</InputAdornment> }
                                }}
                            />
                        </Tooltip>

                    </div>
                ))}
            </div>

            <hr style={{ width: "100%" }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <IECControls
                    setValue={(val) => {
                        if (Object.keys(val).length === 0) { initializeInternalSequence([]); }
                        else { initializeInternalSequence(val as CheckpointSequence[]); }
                        setValidation([])
                    }}
                    value={internalSequence}
                    type="Checkpoint sequence"
                    nonPlural
                />
                <Button
                    startIcon={<AddCircleOutline />}
                    style={{ alignSelf: 'end' }}
                    onClick={() => { setBrowserOpen(true) }}
                >Add checkpoints</Button>
            </div>

            <CheckpointBrowserModal
                open={browserOpen}
                setOpen={setBrowserOpen}
                initialSelected={internalSequence?.map(a => a.title)}
                multiSelect
                onOk={handleChange}
            />

        </DialogContent>
        <DialogActions>
            {loading ? <CircularProgress size={24} /> : <>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={validateAndOk}>OK</Button>

            </>}
        </DialogActions>
    </Dialog>

}