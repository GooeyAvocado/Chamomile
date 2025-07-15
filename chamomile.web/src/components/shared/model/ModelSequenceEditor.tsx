import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, TextField, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import ModelSequence from "../../../model/ModelSequence";
import ModelSelector from "./ModelSelector";
import { useModels } from "../../hooks/useModels";
import { imageUrl } from "../../../api/Images";
import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";
import IECControls from "../IECControls/IECControls";
import { Model } from "../../../model/Model";

export default function ModelSequenceEditor({ open, setOpen, onOk, sequence, currentModel, loading }: {
    open: boolean,
    setOpen: (value: boolean) => void,
    onOk: (val: ModelSequence[]) => void
    currentModel: string,
    sequence?: ModelSequence[]
    loading?: boolean
}) {


    const [internalSequence, setInternalSequence] = useState<ModelSequence[]>([])
    const { models } = useModels();
    const [validation, setValidation] = useState<{
        modelTitle?: string,
        chanceStay?: string,
        loadWeight?: string
    }[]>()

    useEffect(() => {
        if (open) { initializeInternalSequence(sequence ?? []); }
    }, [open]);

    const initializeInternalSequence = (val: ModelSequence[]) => {
        //CHECK: Does the current sequence have the current model?
        if (val?.find(a => a.modelTitle === currentModel)) {
            setInternalSequence(val); //If so then we don't need to do anything 
        } else {
            //Otherwise this really shouldn't happen, but we'll add the current model to the sequence
            setInternalSequence([{
                modelTitle: currentModel,
                chanceStay: 90,
                loadWeight: 1
            } as ModelSequence, ...val ?? []]);
        }
    }

    const validateAndOk = () => {
        const errors = internalSequence.map((s) => {

            const entryErrors = {} as any;
            if (s.modelTitle.length === 0) {
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


    return <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Model Sequence</DialogTitle>
        <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: "75vh" }}>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {internalSequence.map((s, index) => (
                    <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center', paddingTop: "10px" }}>

                        <IconButton disabled={loading || s.modelTitle === currentModel} onClick={() => {
                            const newSequence = [...internalSequence];
                            newSequence.splice(index, 1);
                            setInternalSequence(newSequence);
                            setValidation([])
                        }}>
                            <RemoveCircleOutline />
                        </IconButton>

                        <img
                            src={models?.find(a => a.title === s.modelTitle)?.bannerImage
                                ? imageUrl(models?.find(a => a.title === s.modelTitle)?.bannerImage ?? 0)
                                : "outline.png"}

                            style={{ width: "48px", height: "48px", objectFit: 'cover', objectPosition: 'center top', borderRadius: '5px' }}
                        />

                        <ModelSelector
                            error={!!validation?.[index]?.modelTitle}
                            helperText={validation?.[index]?.modelTitle}
                            model={s.modelTitle} setModel={(m) => {
                                const newSequence = [...internalSequence];
                                newSequence[index].modelTitle = m.title;
                                setInternalSequence(newSequence);
                                setValidation([])
                            }} style={{ flex: "1" }} disabled={s.modelTitle === currentModel || loading} />

                        <Tooltip title="This is the chance that the model will be used for the next image. Setting this too low may cause thrashing between models.">
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

                        <Tooltip title="This is the weight of the model in the sequence, higher means more likely to be used.">
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
                                    htmlInput: {
                                        min: 1,
                                        step: 1
                                    },
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
                        else { initializeInternalSequence(val as ModelSequence[]); }
                        setValidation([])
                    }}
                    value={internalSequence}
                    type="model sequence"
                    nonPlural
                />
                <Button
                    startIcon={<AddCircleOutline />}
                    style={{ alignSelf: 'end' }}
                    onClick={() => {
                        setInternalSequence([
                            ...internalSequence,
                            {
                                modelTitle: "",
                                chanceStay: 95,
                                loadWeight: 1
                            } as ModelSequence
                        ]);
                    }}
                >Add another model</Button>

            </div>

        </DialogContent>
        <DialogActions>
            {loading ? <CircularProgress size={24} /> : <>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={validateAndOk}>OK</Button>

            </>}
        </DialogActions>
    </Dialog>

}