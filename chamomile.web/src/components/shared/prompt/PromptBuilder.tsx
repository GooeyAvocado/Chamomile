import { Coffee, DirectionsRun, ExpandLess, ExpandMore, Height, ModelTraining, Percent, Terminal, ThumbDown, Tune, Yard } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField, Tooltip } from "@mui/material";
import { useState } from "react";
import PromptButton from "./PromptButton";
import { usePrompt } from "../../hooks/usePrompt";
import PromptModelSelectorModal from "./PromptModelSelectorModal";
import { Prompt } from "../../../model/Prompt";
import PromptEditorModal from "./PromptEditorModal";
import useApi from "../../hooks/useApi";
import { createPrompt } from "../../../api/Prompts";
import { useSnackbar } from "notistack";
import PromptSelectorModal from "./PromptSelectorModal";
import VariableEditor from "../variables/VariableEditor";
import { enqueuePrompt } from "../../../api/Images";
import { hydratePrompt } from "../Utils";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";

export default function PromptBuilder(props: {
    prompt?: Prompt,
    setPrompt?: (val: Prompt) => void
    alwaysExpand?: boolean,
    noBrew?: boolean,
    preview?: boolean
}) {

    const { alwaysExpand, noBrew, prompt: promptOverride, setPrompt: setPromptOverride, preview } = props

    const { prompt: globalPrompt, setPrompt: setGlobalPrompt, orderAmount, setOrderAmount, variables } = usePrompt()
    const [expanded, setExpanded] = useState(false)
    const [modelsOpen, setModelsOpen] = useState(false)
    const [varsOpen, setVarsOpen] = useState(false)
    const brewApi = useApi(enqueuePrompt)

    const createPromptApi = useApi(createPrompt)
    const { enqueueSnackbar } = useSnackbar();
    const {vertical} = useWindowDimensions();

    const [saveOpen, setSaveOpen] = useState(false)
    const [loadOpen, setLoadOpen] = useState(false)

    const prompt = promptOverride ?? globalPrompt
    const setPrompt = setPromptOverride ?? setGlobalPrompt

    const onBrew = () => {
        for (let index = 0; index < orderAmount; index++) {
            brewApi.fetch(() => {}, () => {
                enqueueSnackbar("Could not queue image!", { variant: 'error' })
            }, hydratePrompt(prompt,variables))
        }

        enqueueSnackbar(`${orderAmount} orders placed!`, { variant: 'success' })
    }
    const onSave = (val: Prompt) => {
        createPromptApi.fetch(() => {
            enqueueSnackbar("Recipe saved!", { variant: 'success' })
        }, () => {
            enqueueSnackbar("Could not save recipe!", { variant: 'error' })
        }, val)
    }

    const onLoad = (val: Prompt) => {
        setGlobalPrompt(val);
        setLoadOpen(false)
    }

    return <>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <TextField disabled={preview}
                value={prompt.positivePrompt} onChange={(e) => setPrompt({ ...prompt, positivePrompt: e.target.value })}
                placeholder={vertical ? `What'll you like?` : "What do you want to see?"} multiline maxRows={vertical ? 5 : 7} minRows={vertical ? 5 : undefined}
                onKeyUp={(e)=>{
                    if(noBrew) return;
                    if(e.ctrlKey && e.key=='Enter') onBrew()
                }}
                fullWidth slotProps={{
                    htmlInput: { style: { fontSize: '.8em', fontFamily: 'monospace' } },
                    input: {

                        startAdornment: (
                            <InputAdornment position="start"> <Terminal /> </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <div style={{display:'flex', flexDirection:vertical ? 'column' : undefined}}>
                                    {!noBrew && <Tooltip title="Variables">
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
            {!noBrew && !vertical && <PromptButton onBrew={onBrew} onLoad={() => setLoadOpen(true)} onSave={() => setSaveOpen(true)} />}
        </div>

        {(alwaysExpand || expanded) && <>
            <div style={{ marginTop: "10px" }}>
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
                />
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
                {/* Amount */}
                {!noBrew &&
                    <TextField type="number"  disabled={preview}
                        value={orderAmount} onChange={(e) => setOrderAmount(Math.max(parseInt(e.target.value), 1))}
                        placeholder="Steps"
                        fullWidth slotProps={{
                            input: {
                                startAdornment: (<InputAdornment position="start"> <Coffee /> </InputAdornment>),
                                endAdornment: (<InputAdornment position="end">Amount</InputAdornment>)
                            }
                        }}
                        style={{ flex: "1", minWidth: "200px" }}
                    />
                }
                {/* Width */}
                <TextField type="number"  disabled={preview}
                    value={prompt.width} onChange={(e) => setPrompt({ ...prompt, width: parseInt(e.target.value) })}
                    placeholder="Width"
                    fullWidth slotProps={{
                        input: {
                            startAdornment: (<InputAdornment position="start"> <Height sx={{ transform: 'rotate(90deg)' }} /> </InputAdornment>),
                            endAdornment: (<InputAdornment position="end">px</InputAdornment>)
                        }
                    }}
                    style={{ flex: "1", minWidth: "200px" }}
                />
                {/* Height */}
                <TextField type="number"  disabled={preview}
                    value={prompt.height} onChange={(e) => setPrompt({ ...prompt, height: parseInt(e.target.value) })}
                    placeholder="Height"
                    fullWidth slotProps={{
                        input: {
                            startAdornment: (<InputAdornment position="start"> <Height /> </InputAdornment>),
                            endAdornment: (<InputAdornment position="end">px</InputAdornment>)
                        }
                    }}
                    style={{ flex: "1", minWidth: "200px" }}
                />

                {/* Steps */}
                <TextField type="number"  disabled={preview}
                    value={prompt.steps} onChange={(e) => setPrompt({ ...prompt, steps: parseInt(e.target.value) })}
                    placeholder="Steps"
                    fullWidth slotProps={{
                        input: {
                            startAdornment: (<InputAdornment position="start"> <DirectionsRun /> </InputAdornment>),
                            endAdornment: (<InputAdornment position="end">Steps</InputAdornment>)
                        }
                    }}
                    style={{ flex: "1", minWidth: "200px" }}
                />

                {/* CFG Scale */}
                <TextField type="number"  disabled={preview}
                    value={prompt.cfgScale} onChange={(e) => setPrompt({ ...prompt, cfgScale: parseFloat(e.target.value) })}
                    placeholder="CFG Scale"
                    fullWidth slotProps={{
                        htmlInput: {
                            step: 0.1
                        },
                        input: {
                            startAdornment: (<InputAdornment position="start"> <Tune /> </InputAdornment>),
                            endAdornment: (<InputAdornment position="end">CFG Scale</InputAdornment>)
                        }
                    }}
                    style={{ flex: "1", minWidth: "200px" }}
                />

                {/* Seed */}
                {!noBrew &&
                    <TextField type="number"
                        value={prompt.seed} onChange={(e) => setPrompt({ ...prompt, seed: parseInt(e.target.value) })}
                        placeholder="Seed"
                        fullWidth slotProps={{
                            input: {
                                startAdornment: (<InputAdornment position="start"> <Yard /> </InputAdornment>),
                                endAdornment: (<InputAdornment position="end">Seed</InputAdornment>)
                            }
                        }}
                        style={{ flex: "1", minWidth: "200px" }}
                    />
                }

            </div>
        </>}

        {!noBrew && vertical && <div style={{width:'100%', marginTop:'10px'}}>
            <PromptButton onBrew={onBrew} onLoad={() => setLoadOpen(true)} onSave={() => setSaveOpen(true)} fullWidth/>
        </div>}

        <VariableEditor open={varsOpen} setOpen={setVarsOpen}/>
        <PromptModelSelectorModal open={modelsOpen} setOpen={setModelsOpen} noBrew={noBrew} prompt={promptOverride} setPrompt={setPromptOverride} />

        {!noBrew && <>
            <PromptEditorModal prompt={globalPrompt} open={saveOpen} setOpen={setSaveOpen} onOk={onSave} title="Save Recipe" />
            <PromptSelectorModal open={loadOpen} setOpen={setLoadOpen} onOk={onLoad} />
        </>}

    </>

}