import { Close, Coffee, DataObject, DirectionsRun, ExpandMore, ModelTraining, OpenWith, ReceiptLong, ThumbDown, Tune, Yard } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField, Tooltip } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import PromptButton from "./PromptButton";
import { usePrompt } from "../../hooks/usePrompt";
import PromptModelSelectorModal from "./PromptModelSelectorModal";
import { Prompt } from "../../../model/Prompt";
import PromptEditorModal from "./PromptEditorModal";
import useApi from "../../hooks/useApi";
import { createPrompt, getWildcards, updatePrompt } from "../../../api/Prompts";
import { useSnackbar } from "notistack";
import PromptSelectorModal from "./PromptSelectorModal";
import VariableEditor from "../variables/VariableEditor";
import { enqueuePrompts, imageUrl } from "../../../api/Images";
import { hydratePrompt } from "../Utils";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import SizePresetSelector from "./SizePresetSelector";
import SamplerSelector from "./SamplerSelector";
import AreYouSureModal from "../modals/AreYouSureModal";
import PromptCard from "./PromptCard";
import { usePingPong } from "../../hooks/usePingPong";
import { useLoras } from "../../hooks/useLoras"
import AutocompleteTextfield, { AutoCompletes } from "../autocompleteTextField/AutocompleteTextField";
import { Lora } from "../../../model/Lora";
import PromptboxImageSample from "./preview/PromptboxImageSample";
import { FilterOptions } from "../../../model/FilterOptions";

export default function PromptBuilder(props: {
    prompt?: Prompt,
    fullHeight?: boolean
    setPrompt?: (val: Prompt) => void
    alwaysExpand?: boolean,
    noBrew?: boolean,
    preview?: boolean
    filter?: FilterOptions
    setFilter?: (val: FilterOptions) => void
}) {

    const { alwaysExpand, noBrew, prompt: promptOverride, setPrompt: setPromptOverride, preview, fullHeight, filter, setFilter } = props
    const { prompt: globalPrompt, setPrompt: setGlobalPrompt, orderAmount, setOrderAmount, variables } = usePrompt()
    const [expanded, setExpanded] = useState(false)
    const [expandedHeight, setExpandedHeight] = useState("0px")
    const [modelsOpen, setModelsOpen] = useState(false)
    const [varsOpen, setVarsOpen] = useState(false)
    const [saveAys, setSaveAys] = useState(false)
    const brewApi = useApi(enqueuePrompts)
    const { album } = usePrompt();

    const expandRef = useRef<HTMLDivElement>(null);

    const { loras } = useLoras();
    const { data: wildcards } = useApi(getWildcards, true)

    const createPromptApi = useApi(createPrompt)
    const updatePromptApi = useApi(updatePrompt)

    const { enqueueSnackbar } = useSnackbar();
    const { vertical, width } = useWindowDimensions();
    const { pong } = usePingPong();

    const [sizePresetOpen, setSizePresetOpen] = useState(false)
    const [saveOpen, setSaveOpen] = useState(false)
    const [loadOpen, setLoadOpen] = useState(false)

    const prompt = promptOverride ?? globalPrompt
    const updateGlobalPrompt = (val: Prompt) => setGlobalPrompt(val, true)
    const setPrompt = setPromptOverride ?? updateGlobalPrompt

    const onBrew = (amountOverride?: number) => {
        const allPrompts = []
        for (let index = 0; index < (amountOverride ?? orderAmount); index++) {
            allPrompts.push(hydratePrompt({
                ...prompt, orderData: {
                    sample: prompt.sampleImage ?? -1,
                    source: "PROMPTBOX",
                    albums: album?.id ? [album?.id] : []
                }
            }, variables, index));
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
                    e.preventDefault()
                    if (pong?.SD) onBrew(e.altKey ? 1 : undefined)
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

    useEffect(() => {
        if (expandRef.current) {
            setExpandedHeight(expanded ? `${expandRef.current.scrollHeight}px` : "0px");
        }
    }, [expanded, width]);

    const dPromptVarsRegex = /\$\{([a-zA-Z_][a-zA-Z0-9_]*)=([^}]+)\}/g;
    const matches = [...prompt.positivePrompt.matchAll(dPromptVarsRegex)];
    const dPromptVars = matches.map(m => ({
        key: m[1],
        value: m[2]
    }));

    return <>

        {/* Collapsed Contents */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>

            <AutocompleteTextfield disabled={preview} autocompleteZIndex={!noBrew ? 10 : undefined}
                value={prompt.positivePrompt} onChange={(e) => {
                    setPrompt({ ...prompt, positivePrompt: e.target.value })
                }}
                placeholder={vertical ? `What'll you like?` : "What do you want to see?"} multiline
                maxRows={vertical ? 5 : 7}
                minRows={vertical ? 5 : fullHeight ? 7 : undefined}
                onKeyDown={onKeyDown}
                data={[
                    {
                        name: "LoRAs",
                        data: loras?.filter(a => a.isAvailable) ?? [],
                        prefix: "<",
                        suffix: ">",
                        matcher: (val, query) => {
                            const q = query.toLowerCase().replace("lora:", "")
                            return val.alias.toLowerCase().includes(q) ||
                                val.name.toLowerCase().includes(q)
                        },
                        value: (val) => `<lora:${val.alias}:1>`,
                        renderer: (val) => <div style={{ display: 'flex', alignItems: 'center', gap: "10px" }}>
                            <img src={val.bannerImage ? imageUrl(val.bannerImage) : "/color.png"} width={32} height={32} />
                            <div>
                                <div style={{ fontSize: ".8em" }}>{val.name}</div>
                                <div style={{ fontSize: ".7em" }}>{val.alias}</div>
                            </div>

                        </div>

                    } as AutoCompletes<Lora>,
                    {
                        name: "Wildcards",
                        data: Object.keys(wildcards ?? {}) ?? [],
                        prefix: "__",
                        suffix: "__",
                        matcher: (val, query) => {
                            const q = query.toLowerCase()
                            return val.toLowerCase().includes(q)
                        },
                        value: (val) => `__${val}__`,
                        renderer: (val) => <div>
                            <div>{val}</div>
                            <div style={{ fontSize: ".8em", opacity: ".8" }}>{wildcards[val].join(", ")}</div>
                        </div>,
                    } as AutoCompletes<string>,

                    {
                        name: "DynamicPrompts Vars",
                        data: dPromptVars ?? [],
                        prefix: "${",
                        suffix: "}",
                        matcher: (val, query) => val.key.toLowerCase().includes(query.toLowerCase()),
                        value: (val) => `$\{${val.key}}`,
                        renderer: (val) => <div>
                            <div>{val.key}</div>
                            <div style={{ fontSize: ".8em", opacity: ".8" }}>{val.value}</div>
                        </div>,
                    } as AutoCompletes<{
                        key: string,
                        value: string
                    }>,
                ]}

                fullWidth slotProps={{
                    htmlInput: { style: { fontSize: '.8em', fontFamily: 'monospace' } },
                    input: {

                        startAdornment: (
                            <InputAdornment position="start">
                                <div style={{ display: "flex", alignSelf: "center", alignItems: 'center' }}>
                                    {(((prompt.sampleImage ?? -1) > 0 || prompt.id) && !noBrew) //if we have an ID (from a saved prompt) or Sample Image (from an existing image)
                                        ? <PromptboxImageSample prompt={prompt} clearSample={() => { setPrompt({ ...prompt, sampleImage: undefined, id: undefined, name: "" }) }} />
                                        : <ReceiptLong />}
                                </div>
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <div style={{ display: 'flex', flexDirection: vertical ? 'column' : undefined }}>
                                    {!noBrew && <Tooltip title="Wildcards and Overrides">
                                        <IconButton onClick={() => { setVarsOpen(true) }}><DataObject /></IconButton>
                                    </Tooltip>}
                                    {!preview && <Tooltip title="Models">
                                        <IconButton onClick={() => { setModelsOpen(true) }}><ModelTraining /></IconButton>
                                    </Tooltip>}
                                    {!alwaysExpand && <Tooltip title="More Options">
                                        <IconButton onClick={() => { setExpanded?.(!expanded) }}><ExpandMore
                                            style={{
                                                transition: "transform 0.2s ease",
                                                transform: expanded ? "rotate(180deg)" : "rotate(0deg)"
                                            }}
                                        /></IconButton>
                                    </Tooltip>}
                                </div>
                            </InputAdornment>
                        )
                    }
                }}
            />

            {!noBrew && !vertical &&
                <div style={{ width: "120px" }}>
                    <PromptButton
                        fullWidth
                        onBrew={onBrew}
                        onLoad={() => setLoadOpen(true)}
                        onSave={existingPrompt ? () => setSaveAys(true) : () => setSaveOpen(true)}
                        onSaveAs={() => setSaveOpen(true)}
                        saveAsEnabled={existingPrompt}
                    />
                </div>}
        </div>

        {/* Expanded contents */}
        <div ref={expandRef} style={{
            paddingRight: !noBrew && !vertical ? "130px" : undefined,
            overflowY: "hidden", maxHeight: alwaysExpand ? undefined : expandedHeight,
            transition: "max-height 0.2s ease"
        }}>
            {/* Row 1: negative prompt */}
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

            </div>

            {/* Row 2: Literally everything else */}
            <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>

                {/* Group 1: Model and Samplers */}
                <div style={{
                    flex: "1", alignItems: 'center', borderRadius: "4px",
                    border: "1px solid rgba(255,255,255, 0.23)", minWidth: "260px"
                }}>

                    {/* This is necessary. If this isn't in a sub-div, the padding adds to the width and makes flex:1 not be half and half */}
                    {/* border-box does not solve this issue either. I have no idea why, but hey, this works. So we're good */}
                    <div style={{
                        display: 'flex', gap: "10px", width: "100%", height: width < 350 ? undefined : "56px",
                        flexDirection: width < 350 ? "column" : undefined, alignItems: 'center', padding: "0 16px"
                    }}>
                        <IconButton onClick={() => setSizePresetOpen(true)}><OpenWith sx={{ margin: width < 350 ? "7px" : "-7px" }} /> </IconButton>

                        {/* Width */}
                        <TextField type="number" disabled={preview}
                            value={prompt.width} onChange={(e) => setPrompt({ ...prompt, width: parseInt(e.target.value) })}
                            placeholder="Width"
                            fullWidth slotProps={{
                                htmlInput: {
                                    min: 1
                                },

                            }} variant="standard"
                            style={{ flex: "1", minWidth: "45px" }}
                            onKeyDown={onKeyDown} size="small"
                        />
                        <Close fontSize="inherit" />
                        {/* Height */}
                        <TextField type="number" disabled={preview}
                            value={prompt.height} onChange={(e) => setPrompt({ ...prompt, height: parseInt(e.target.value) })}
                            placeholder="Height"
                            fullWidth slotProps={{
                                htmlInput: { min: 1 },
                            }} variant="standard"
                            style={{ flex: "1", minWidth: "45px" }} size="small"
                            onKeyDown={onKeyDown}
                        />
                        <div>px</div>


                    </div>
                </div>

                <SamplerSelector
                    sampler={prompt.sampler}
                    setSampler={(s) => { setPrompt({ ...prompt, sampler: s }) }}
                    style={{ flex: "1", minWidth: "260px" }}
                    disabled={preview}
                />


                {/* Group 2: Everything else */}
                <div style={{ display: 'flex', flex: "2", gap: "10px", flexWrap: width < 1000 ? "wrap" : undefined }}>
                    <div style={{
                        display: 'flex', gap: "10px", flex: "1", alignItems: 'center',
                        flexDirection: width < 350 ? "column" : undefined, height: width < 350 ? undefined : "56px"
                    }}>
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
                            style={{ flex: "1", minWidth: "140px" }}
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
                                    endAdornment: (<InputAdornment position="end">CFG</InputAdornment>)
                                }
                            }}
                            style={{ flex: "1", minWidth: "140px" }}
                            onKeyDown={onKeyDown}
                        />
                    </div>

                    {!noBrew && <div style={{
                        display: 'flex', gap: "10px", flex: "1", alignItems: 'center',
                        flexDirection: width < 465 ? "column" : undefined, height: width < 465 ? undefined : "56px"
                    }}>
                        <TextField type="number"
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
                        />

                        {/* Amount */}
                        <TextField type="number" disabled={preview}
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

                    </div>}
                </div>

            </div>
        </div>

        {/* Vertical promptbutton */}
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

        {/* Modals */}
        <VariableEditor open={varsOpen} setOpen={setVarsOpen} />
        <PromptModelSelectorModal open={modelsOpen} setOpen={setModelsOpen} noBrew={noBrew} prompt={promptOverride} setPrompt={setPromptOverride} />
        <SizePresetSelector
            open={sizePresetOpen} setOpen={setSizePresetOpen}
            setSize={(width, height) => { setPrompt({ ...prompt, width: width, height: height }) }}
        />

        {/* Modals that only show up if this has the ability to brew */}
        {!noBrew && <>
            <AreYouSureModal open={saveAys} setOpen={setSaveAys} onYes={() => { onSave(prompt) }} loading={updatePromptApi.loading} title="Overwrite this prompt?">
                <PromptCard prompt={prompt} />
            </AreYouSureModal>
            <PromptEditorModal prompt={globalPrompt} open={saveOpen} setOpen={setSaveOpen} onOk={onSaveAs} title={`Save Recipe${existingPrompt ? " as..." : ""}`} />
            <PromptSelectorModal open={loadOpen} setOpen={setLoadOpen} onOk={onLoad} filter={filter} setFilter={setFilter ? (val) => {
                setFilter(val)
                setLoadOpen(false)
            } : undefined} />
        </>}

    </>

}