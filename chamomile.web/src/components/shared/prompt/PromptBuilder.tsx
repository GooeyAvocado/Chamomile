import { Coffee, DirectionsRun, ExpandLess, ExpandMore, Height, ModelTraining, Percent, Terminal, ThumbDown, Tune, Yard } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField, Tooltip } from "@mui/material";
import { useState } from "react";
import PromptButton from "./PromptButton";
import { usePrompt } from "../../hooks/usePrompt";
import PromptModelSelectorModal from "./PromptModelSelectorModal";
import { Prompt } from "../../../model/Prompt";
import PromptEditorModal from "./PromptEditorModal";
import useApi from "../../hooks/useApi";
import { createPrompt, updatePrompt } from "../../../api/Prompts";
import { useSnackbar } from "notistack";
import PromptSelectorModal from "./PromptSelectorModal";
import VariableEditor from "../variables/VariableEditor";
import { enqueuePrompts } from "../../../api/Images";
import { hydratePrompt } from "../Utils";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import SizePresetSelector from "./SizePresetSelector";
import SamplerSelector from "./SamplerSelector";
import AreYouSureModal from "../modals/AreYouSureModal";
import PromptCard from "./PromptCard";
import { usePingPong } from "../../hooks/usePingPong";

export default function PromptBuilder(props: {
    prompt?: Prompt,
    fullHeight?: boolean
    setPrompt?: (val: Prompt) => void
    alwaysExpand?: boolean,
    noBrew?: boolean,
    preview?: boolean
}) {

    const { alwaysExpand, noBrew, prompt: promptOverride, setPrompt: setPromptOverride, preview, fullHeight } = props

    const { prompt: globalPrompt, setPrompt: setGlobalPrompt, orderAmount, setOrderAmount, variables } = usePrompt()
    const [expanded, setExpanded] = useState(false)
    const [modelsOpen, setModelsOpen] = useState(false)
    const [varsOpen, setVarsOpen] = useState(false)
    const [saveAys, setSaveAys] = useState(false)
    const brewApi = useApi(enqueuePrompts)

    const createPromptApi = useApi(createPrompt)
    const updatePromptApi = useApi(updatePrompt)

    const { enqueueSnackbar } = useSnackbar();
    const { vertical } = useWindowDimensions();
    const { pong } = usePingPong();

    const [sizePresetOpen, setSizePresetOpen] = useState(false)
    const [saveOpen, setSaveOpen] = useState(false)
    const [loadOpen, setLoadOpen] = useState(false)

    const prompt = promptOverride ?? globalPrompt
    const setPrompt = setPromptOverride ?? setGlobalPrompt

    const onBrew = (amountOverride?: number) => {
        const allPrompts = []
        for (let index = 0; index < (amountOverride ?? orderAmount); index++) {
            allPrompts.push(hydratePrompt(prompt, variables, index));
        }

        brewApi.fetch((val) => {
            if ((amountOverride ?? orderAmount) !== val?.jobIds.length) {
                enqueueSnackbar(`Only ${val?.jobIds.length} orders placed!`, { variant: 'warning' })
            } else {
                if (amountOverride === 1) {
                    enqueueSnackbar(`Single order placed!`, { variant: 'success' })
                } else {
                    enqueueSnackbar(`${val?.jobIds.length} orders placed!`, { variant: 'success' })
                }
            }

        }, () => {
            enqueueSnackbar("Could not queue images!", { variant: 'error' })
        }, allPrompts)

    }

    const onSaveAs = (val: Prompt) => {
        createPromptApi.fetch((val) => {
            enqueueSnackbar("Recipe saved!", { variant: 'success' })
            if (val) setPrompt(val);
        }, () => {
            enqueueSnackbar("Could not save recipe!", { variant: 'error' })
        }, val)
    }

    const onSave = (val: Prompt) => {
        setSaveAys(false);
        updatePromptApi.fetch((val) => {
            enqueueSnackbar("Recipe saved!", { variant: 'success' })
            if (val) setPrompt(val);
        }, () => {
            enqueueSnackbar("Could not save recipe!", { variant: 'error' })
        }, val)
    }

    const onLoad = (val: Prompt) => {
        setGlobalPrompt(val);
        setLoadOpen(false)
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (noBrew) return;
        if (e.ctrlKey) {
            switch (e.key) {
                case 'Enter':
                    if (pong?.SD) onBrew()
                    else enqueueSnackbar("Cannot enqueue prompt, Stable Diffusion is unavailable", { variant: 'warning' })
                    break;
                case 's':
                case 'S':
                    e.preventDefault();
                    if (existingPrompt && !e.shiftKey) setSaveAys(true)
                    else setSaveOpen(true)
                    break;
                case 'o':
                case 'O':
                    e.preventDefault();
                    setLoadOpen(true)
                    break;
                default:
                    break;
            }
        }

    }

    const existingPrompt = !!prompt.id && prompt.id > 0;

    return <>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <TextField disabled={preview}
                value={prompt.positivePrompt} onChange={(e) => setPrompt({ ...prompt, positivePrompt: e.target.value })}
                placeholder={vertical ? `What'll you like?` : "What do you want to see?"} multiline maxRows={vertical ? 5 : 7} minRows={vertical ? 5 : fullHeight ? 7 : undefined}

                onKeyDown={onKeyDown}

                fullWidth slotProps={{
                    htmlInput: { style: { fontSize: '.8em', fontFamily: 'monospace' } },
                    input: {

                        startAdornment: (
                            <InputAdornment position="start"> <Terminal /> </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <div style={{ display: 'flex', flexDirection: vertical ? 'column' : undefined }}>
                                    {!noBrew && <Tooltip title="Variables and Overrides">
                                        <IconButton onClick={() => { setVarsOpen(true) }}><Percent /></IconButton>
                                    </Tooltip>}
                                    {!preview && <Tooltip title="Select Models">
                                        <IconButton onClick={() => { setModelsOpen(true) }}><ModelTraining /></IconButton>
                                    </Tooltip>}
                                    {!alwaysExpand && <Tooltip title="More Options">
                                        <IconButton onClick={() => { setExpanded(!expanded) }}>{expanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
                                    </Tooltip>}
                                </div>
                            </InputAdornment>
                        )
                    }
                }}
            />
            {!noBrew && !vertical &&
                <PromptButton
                    onBrew={onBrew}
                    onLoad={() => setLoadOpen(true)}
                    onSave={existingPrompt ? () => setSaveAys(true) : () => setSaveOpen(true)}
                    onSaveAs={() => setSaveOpen(true)}
                    saveAsEnabled={existingPrompt}
                />}
        </div>

        {(alwaysExpand || expanded) && <>
            <div style={{ marginTop: "10px", display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <TextField disabled={preview}
                    value={prompt.negativePrompt} onChange={(e) => setPrompt({ ...prompt, negativePrompt: e.target.value })}
                    placeholder="Negative Prompt" multiline maxRows={4}
                    fullWidth slotProps={{
                        htmlInput: { style: { fontSize: '.8em', fontFamily: 'monospace' } },
                        input: {
                            startAdornment: (
                                <InputAdornment position="start"> <ThumbDown /> </InputAdornment>
                            ),
                        }
                    }}
                    style={noBrew ? { flex: "5" } : { flex: 5, minWidth: '200px' }}
                    onKeyDown={onKeyDown}
                />

                {/* Amount */}
                {!noBrew && <TextField type="number" disabled={preview}
                    value={orderAmount} onChange={(e) => setOrderAmount(Math.max(parseInt(e.target.value), 1))}
                    placeholder="Steps"
                    fullWidth slotProps={{
                        input: {
                            startAdornment: (<InputAdornment position="start"> <Coffee /> </InputAdornment>),
                            endAdornment: (<InputAdornment position="end">Amount</InputAdornment>)
                        }
                    }}
                    style={{ flex: "1", minWidth: "200px" }}
                    onKeyDown={onKeyDown}
                />

                }

            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
                {/* Width */}
                <TextField type="number" disabled={preview}
                    value={prompt.width} onChange={(e) => setPrompt({ ...prompt, width: parseInt(e.target.value) })}
                    placeholder="Width"
                    fullWidth slotProps={{
                        htmlInput: {
                            min: 1
                        },
                        input: {
                            startAdornment: (<InputAdornment position="start">
                                <IconButton onClick={() => setSizePresetOpen(true)}><Height sx={{ transform: 'rotate(90deg)', margin: "-7px" }} /> </IconButton>
                            </InputAdornment>),
                            endAdornment: (<InputAdornment position="end">px</InputAdornment>)
                        }
                    }}
                    style={{ flex: "1", minWidth: "200px" }}
                    onKeyDown={onKeyDown}
                />
                {/* Height */}
                <TextField type="number" disabled={preview}
                    value={prompt.height} onChange={(e) => setPrompt({ ...prompt, height: parseInt(e.target.value) })}
                    placeholder="Height"
                    fullWidth slotProps={{
                        htmlInput: {
                            min: 1
                        },
                        input: {
                            startAdornment: (<InputAdornment position="start">
                                <IconButton onClick={() => setSizePresetOpen(true)}><Height style={{ margin: "-7px" }} /> </IconButton>
                            </InputAdornment>),
                            endAdornment: (<InputAdornment position="end">px</InputAdornment>)
                        }
                    }}
                    style={{ flex: "1", minWidth: "200px" }}
                    onKeyDown={onKeyDown}
                />

                {/* Steps */}
                <TextField type="number" disabled={preview}
                    value={prompt.steps} onChange={(e) => setPrompt({ ...prompt, steps: parseInt(e.target.value) })}
                    placeholder="Steps"
                    fullWidth slotProps={{
                        htmlInput: {
                            min: 1
                        },
                        input: {
                            startAdornment: (<InputAdornment position="start"> <DirectionsRun /> </InputAdornment>),
                            endAdornment: (<InputAdornment position="end">Steps</InputAdornment>)
                        }
                    }}
                    style={{ flex: "1", minWidth: "200px" }}
                    onKeyDown={onKeyDown}
                />

                {/* CFG Scale */}
                <TextField type="number" disabled={preview}
                    value={prompt.cfgScale} onChange={(e) => setPrompt({ ...prompt, cfgScale: parseFloat(e.target.value) })}
                    placeholder="CFG Scale"
                    fullWidth slotProps={{
                        htmlInput: {
                            min: 0.1,
                            step: 0.1
                        },
                        input: {
                            startAdornment: (<InputAdornment position="start"> <Tune /> </InputAdornment>),
                            endAdornment: (<InputAdornment position="end">CFG Scale</InputAdornment>)
                        }
                    }}
                    style={{ flex: "1", minWidth: "200px" }}
                    onKeyDown={onKeyDown}
                />

                {/* {!noBrew && <div style={{ flex: '1', minWidth: '200px' }}>
                    <SchedulerSelector scheduler={prompt.scheduleType} setScheduler={(s) => { setPrompt({ ...prompt, scheduleType: s }) }} />
                </div>} */}

                {!noBrew && <div style={{ flex: "1", minWidth: "200px" }}>
                    <SamplerSelector sampler={prompt.sampler} setSampler={(s) => { setPrompt({ ...prompt, sampler: s }) }} />
                </div>}

                {!noBrew && <TextField type="number"
                    value={prompt.seed} onChange={(e) => setPrompt({ ...prompt, seed: parseInt(e.target.value) })}
                    placeholder="Seed"
                    fullWidth slotProps={{
                        htmlInput: {
                            min: -1
                        },
                        input: {
                            startAdornment: (<InputAdornment position="start">
                                <IconButton onClick={() => setPrompt({ ...prompt, seed: Math.floor(Math.random() * 1000000000) })}><Yard style={{ margin: "-7px" }} /></IconButton>
                            </InputAdornment>),
                            endAdornment: (<InputAdornment position="end">Seed</InputAdornment>)
                        }
                    }}
                    style={{ flex: "1", minWidth: "200px" }}
                    onKeyDown={onKeyDown}
                />}


            </div>
        </>}

        {!noBrew && vertical && <div style={{ width: '100%', marginTop: '10px' }}>
            <PromptButton
                onBrew={onBrew}
                onLoad={() => setLoadOpen(true)}
                onSave={existingPrompt ? () => setSaveAys(true) : () => setSaveOpen(true)}
                onSaveAs={() => setSaveOpen(true)}
                saveAsEnabled={existingPrompt}
                fullWidth
            />
        </div>}

        <VariableEditor open={varsOpen} setOpen={setVarsOpen} />
        <PromptModelSelectorModal open={modelsOpen} setOpen={setModelsOpen} noBrew={noBrew} prompt={promptOverride} setPrompt={setPromptOverride} />
        <SizePresetSelector
            open={sizePresetOpen} setOpen={setSizePresetOpen}
            setSize={(width, height) => { setPrompt({ ...prompt, width: width, height: height }) }}
        />

        {!noBrew && <>
            <AreYouSureModal open={saveAys} setOpen={setSaveAys} onYes={() => { onSave(prompt) }} loading={updatePromptApi.loading} title="Overwrite this prompt?">
                <PromptCard prompt={prompt} />
            </AreYouSureModal>
            <PromptEditorModal prompt={globalPrompt} open={saveOpen} setOpen={setSaveOpen} onOk={onSaveAs} title={`Save Recipe${existingPrompt ? " as..." : ""}`} />
            <PromptSelectorModal open={loadOpen} setOpen={setLoadOpen} onOk={onLoad} />
        </>}

    </>

}