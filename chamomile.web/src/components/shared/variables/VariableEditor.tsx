import { Alert, AlertTitle, Autocomplete, Button, Card, CardContent, CircularProgress, IconButton, InputAdornment, MenuItem, Select, TextField, Tooltip } from "@mui/material"
import { usePrompt } from "../../hooks/usePrompt"
import { promptPreview, TEMPLATE_CALL_REGEX } from "../Utils"
import { Add, Assignment, Delete, HomeRepairService, ReceiptLong } from "@mui/icons-material"
import { useEffect, useMemo, useState } from "react"
import { Prompt } from "../../../model/Prompt"
import useApi from "../../hooks/useApi"
import { getWildcards } from "../../../api/Prompts"
import TabbedModal from "../modals/TabbedModal/TabbedModal"
import TabbedModalTitle from "../modals/TabbedModal/TabbedModalTitle"
import TabbedModalConsistentContent from "../modals/TabbedModal/TabbedModalConsistentContent"
import TabbedModalActions from "../modals/TabbedModal/TabbedModalActions"
import TabbedModalTabContent from "../modals/TabbedModal/TabbedModalTabContent"
import { useWindowDimensions } from "../../hooks/useWindowDimensions"
import IECControls from "../IECControls/IECControls"
import { getTemplates } from "../../../api/Template"
import TemplatesViewer from "../templates/TemplatesViewer"
import Template from "../../../model/Template"
import { imageUrl } from "../../../api/Images"

export default function VariableEditor(props: {
    open: boolean,
    setOpen: (val: boolean) => void
    hidePromptPreview?: boolean
}) {

    const { open, setOpen, hidePromptPreview } = props
    const { variables, setVairables: setVariables, prompt, setPrompt } = usePrompt()

    const [newCustName, setNewCustName] = useState("")
    const [newWildName, setNewWildName] = useState("")
    const [newTemplate, setNewTemplate] = useState("")
    const [templateOpen, setTemplateOpen] = useState(false)

    const { width } = useWindowDimensions()

    const { data: wildcards, fetch: fetchWildcards } = useApi(getWildcards)
    const templatesApi = useApi(getTemplates)

    useEffect(() => {
        if (open) {
            templatesApi.fetch();
            fetchWildcards();
        }
    }, [open])

    const allWildcards = useMemo(() => {
        return wildcards ? Object.keys(wildcards).filter(a => !prompt.positivePrompt.includes(a)) : [] as string[]
    }, [wildcards, prompt.positivePrompt])


    const availableVars = (prompt: Prompt) => {
        const matches = [...prompt.positivePrompt.matchAll(/%([^%]+)%/g)].map(m => m[0]);
        // Get unique values
        return [...new Set(matches)];
    }

    const availableWildcards = (prompt: Prompt) => {
        const matches = [...prompt.positivePrompt.matchAll(/!*__[A-z_0-9\*]*__/g)].map(m => m[0]);
        const presetWildcards = Object.keys(variables ?? {}).filter(a => a.startsWith("__"))
        // Get unique values
        return [...new Set([...matches, ...presetWildcards])];
    }

    const availableCustomNames = () => {
        return Object.keys(variables ?? {}).filter(a => !a.includes("%") && !a.startsWith("__"))
    }

    const allTemplateCalls = (): TemplateCall[] => {
        const calls: TemplateCall[] = [];
        let match: RegExpExecArray | null;

        while ((match = TEMPLATE_CALL_REGEX.exec(prompt.positivePrompt)) !== null) {
            const [fullMatch, name, argString] = match;

            // Look up template
            const template = templatesApi.data?.find(t => t.name.toUpperCase() === name.toUpperCase());

            // Extract args, allow empty
            const paramList =
                argString.trim().length === 0 ? [] : argString.split("~");

            calls.push({
                fullMatch,
                template: template ?? {
                    name: name,
                    description: "Unknown template",
                    params: [],
                    templateString: ""
                } as Template,
                charIndex: match.index,
                paramList
            });
        }

        return calls;
    };

    const updateCall = (call: TemplateCall) => {
        const text = prompt.positivePrompt;

        const start = call.charIndex;
        const end = call.charIndex + call.fullMatch.length;

        const replacement = `[${call.template.name}:${call.paramList.join("~")}]`;

        const updated =
            text.substring(0, start) +
            replacement +
            text.substring(end);

        setPrompt({
            ...prompt,
            positivePrompt: updated
        });
    }

    const deleteCall = (call: TemplateCall) => {
        const text = prompt.positivePrompt;
        const start = call.charIndex;
        const end = call.charIndex + call.fullMatch.length;

        const updated =
            text.substring(0, start) +
            text.substring(end);

        setPrompt({
            ...prompt,
            positivePrompt: updated
        });
    }

    const addCall = (templateName: string) => {
        var template = templatesApi.data?.find(a => a.name === templateName) ?? {
            name: templateName
        } as Template
        setPrompt({
            ...prompt,
            positivePrompt: prompt.positivePrompt + `[${template.name}:]`
        })
    }

    const varNames = !open ? [] : availableVars(prompt)
    const wildNames = !open ? [] : availableWildcards(prompt)
    const custNames = !open ? [] : availableCustomNames()
    const templateCalls = !open ? [] : allTemplateCalls()

    return <>
        <TabbedModal
            open={open} setOpen={setOpen} fullWidth maxWidth="md" titleTabStack={width < 700}
            contentStyle={{ display: 'flex', flexDirection: 'column', height: '75vh' }}
            tabContentStyle={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}
        >
            <TabbedModalTitle>Dynamics</TabbedModalTitle>

            {!hidePromptPreview && <TabbedModalConsistentContent position="top">
                <div style={{ padding: "10px", background: '#222', fontSize: '.9em', fontFamily: 'monospace' }}>
                    <TextField
                        value={promptPreview(prompt, variables, templatesApi.data ?? [])} disabled multiline maxRows={7}
                        fullWidth slotProps={{
                            htmlInput: { style: { fontSize: '.8em', fontFamily: 'monospace' } },
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start"> <ReceiptLong /> </InputAdornment>
                                )
                            }
                        }}
                    />
                </div>
                <hr style={{ width: "100%", marginBottom: '20px' }} />
            </TabbedModalConsistentContent>}

            <TabbedModalTabContent label="Wildcards" >
                {wildNames.map(a => <div key={a} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <IconButton onClick={() => {
                        const updatedVariables = { ...variables };
                        delete updatedVariables[a];
                        setVariables(updatedVariables);
                        setPrompt({ ...prompt, positivePrompt: prompt.positivePrompt.replaceAll(a, "") })
                    }}><Delete /></IconButton>
                    <div style={{ flex: '1' }}>
                        <VariableEditorRow varName={a} value={variables[a]} availableValues={wildcards?.[a.replaceAll("!__", "").replaceAll("__", "")]}
                            updateValue={(val) => {
                                setVariables({ ...variables, [a]: val })
                            }} />
                    </div>
                </div>)}

                <div style={{ display: 'flex', gap: "10px", alignItems: 'center' }}>
                    <IconButton
                        disabled={newWildName.length === 0}
                        onClick={() => {
                            setPrompt({ ...prompt, positivePrompt: `${prompt.positivePrompt} __${newWildName}__` })
                            setNewWildName("")
                        }}>
                        <Add />
                    </IconButton>
                    {(availableWildcards?.length ?? 0) > 0
                        ? <Autocomplete
                            id="free-solo-demo"
                            freeSolo fullWidth
                            options={allWildcards ?? []}
                            value={newWildName} onChange={(_, val) => setNewWildName(val ?? "")}
                            onInputChange={(_, val) => setNewWildName(val
                                .replaceAll("__", "_")
                                .replaceAll("%", "") ?? "")}
                            renderInput={(params) => <TextField {...params} />}
                        />
                        : <TextField
                            placeholder="New wildcard" value={newWildName}
                            fullWidth
                            onChange={(e) => {
                                setNewWildName(e.target.value
                                    .replaceAll("__", "_")
                                    .replaceAll("%", "")
                                )
                            }}
                        />}

                </div>
            </TabbedModalTabContent>

            <TabbedModalTabContent label="Overrides">
                {custNames.map(a => <div key={a} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <IconButton onClick={() => {
                        const updatedVariables = { ...variables };
                        delete updatedVariables[a];
                        setVariables(updatedVariables);
                    }}><Delete /></IconButton>
                    <div style={{ flex: '1' }}>
                        <VariableEditorRow varName={a} value={variables[a]} updateValue={(val) => {
                            setVariables({ ...variables, [a]: val })
                        }} />
                    </div>
                </div>)}

                <div style={{ display: 'flex', gap: "10px", alignItems: 'center' }}>
                    <IconButton
                        disabled={newCustName.length === 0}
                        onClick={() => {
                            setVariables({ ...variables, [newCustName]: "" });
                            setNewCustName("")
                        }}>
                        <Add />
                    </IconButton>
                    <TextField
                        placeholder="New override" value={newCustName}
                        fullWidth
                        onChange={(e) => {
                            setNewCustName(e.target.value
                                .replaceAll("%", "")
                            )
                        }}
                    />
                </div>
            </TabbedModalTabContent>

            {prompt.positivePrompt.includes("%") && <TabbedModalTabContent label="Variables">
                <Alert severity="warning" variant="outlined" style={{ marginBottom: "10px" }}>
                    <AlertTitle>Variables are deprecated</AlertTitle>
                    This feature may be removed soon!
                </Alert>
                {
                    varNames.length === 0 ? <div style={{ height: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ fontSize: '2.5em' }}>%</div>
                        <div style={{ fontSize: '1.3em' }}><b>There are no variables</b></div>
                        <hr style={{ width: '300px' }} />
                        <div style={{ width: "250px", textAlign: 'center', fontSize: '.8em' }}>Add a variable by putting an identifier between percentages (%MyVar%)</div>
                    </div> : varNames.map(a => <VariableEditorRow key={a} varName={a} value={variables[a]} updateValue={(val) => {
                        setVariables({ ...variables, [a]: val })
                    }} />)
                }
            </TabbedModalTabContent>}

            <TabbedModalTabContent label="Templates">
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {!hidePromptPreview && <div style={{ flex: '1', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {templatesApi.loading ?
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: "20px" }}>
                                <CircularProgress />
                                <div>Loading templates...</div>
                            </div>
                            : (templatesApi.data?.length ?? -1) === 0 ? <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                <Assignment style={{ marginBottom: "10px" }} fontSize="large" />
                                <div style={{ fontSize: '1.2em', fontWeight: "600" }}>Welcome to Templates</div>
                                <hr style={{ width: '50%' }} />
                                <div style={{ width: "40%", fontSize: '.8em', textAlign: 'justify' }}>
                                    Templates are a new way to store re-usable, parametrized chunks of prompts for later use.
                                    Add your first template by using the "manage templates" button below.
                                </div>
                            </div> : <>
                                {templateCalls.map(a => <TemplateCallEditor
                                    deleteSelf={() => deleteCall(a)}
                                    call={a}
                                    setCall={updateCall}
                                />)}
                                <Card style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '12px', flexShrink: 0 }}>


                                    <Select
                                        size="small" style={{ flex: 1 }} value={newTemplate}
                                        onChange={(e) => {
                                            setNewTemplate(e.target.value)
                                            console.warn(e.target.value)
                                        }}
                                    >
                                        {templatesApi.data?.map(a => <MenuItem value={a.name}>
                                            <div style={{ display: 'flex', gap: "10px", alignItems: 'center' }}>
                                                {a.sampleImage ? <img
                                                    src={imageUrl(a.sampleImage)}
                                                    style={{ width: "24px", objectFit: 'cover', height: '24px', borderRadius: '2px' }}
                                                /> : <div style={{
                                                    width: '24px', height: '24px', borderRadius: '2px', backgroundColor: "#2F2F2F",
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    <Assignment fontSize="small" />
                                                </div>}
                                                <div style={{ flex: 1 }}>
                                                    {a.name}
                                                </div>
                                            </div>
                                        </MenuItem>)}

                                    </Select>
                                    <Button onClick={() => {
                                        addCall(newTemplate)
                                        setNewTemplate("")
                                    }} disabled={newTemplate.trim().length === 0}>
                                        Add Template
                                    </Button>
                                </Card>
                            </>}

                    </div>}
                    {!hidePromptPreview && <hr style={{ width: '100%' }} />}
                    <div style={{ textAlign: hidePromptPreview ? 'center' : 'right' }}>
                        <Button startIcon={<HomeRepairService />} size="small" onClick={() => {
                            setOpen(false)
                            setTemplateOpen(true)
                        }}>Manage Templates</Button>
                    </div>
                </div>
            </TabbedModalTabContent>

            <TabbedModalActions>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', paddingBottom: '5px', paddingLeft: '5px', paddingRight: '5px' }}>
                    <IECControls
                        setValue={setVariables}
                        value={variables}
                        type="override"
                    />
                    <Button onClick={() => setOpen(false)}>OK</Button>
                </div>
            </TabbedModalActions>

        </TabbedModal>

        <TemplatesViewer open={templateOpen} onClose={(dirty) => {
            setTemplateOpen(false);
            setOpen(true)
            if (dirty) templatesApi.fetch();
        }} />
    </>
}

export interface TemplateCall {
    fullMatch: string
    template: Template
    charIndex: number
    paramList: string[]
}

export function TemplateCallEditor({ call, setCall, deleteSelf }: {
    call: TemplateCall
    setCall: (val: TemplateCall) => void
    deleteSelf: () => void
}) {

    const [internalParams, setInternalParams] = useState(call.paramList)
    useEffect(() => setInternalParams(call.paramList), [call.paramList])

    const updateCallParam = (index: number, value: string) => {

        let newParamList: string[];

        //Special cases:
        //IF: this is the last index and we're clearing it
        if (index === call.paramList.length - 1 && value.trim().length === 0) {
            //Then remove it from the list
            newParamList = [...call.paramList].slice(0, -1);
            // Remove any trailing empty params
            while (newParamList.length > 0 && (newParamList[newParamList.length - 1] ?? "").trim().length === 0) {
                newParamList.pop();
            }

        } else if (index >= call.paramList.length) {

            newParamList = [...call.paramList]
            while (index !== newParamList.length) {
                newParamList.push("")
            }
            newParamList.push(value)
        } else {
            newParamList = [...call.paramList].map((a, i) =>
                i === index ? value : a
            )
        }
        setInternalParams(newParamList)
    }

    const syncCallParams = () => {
        setCall({ ...call, paramList: internalParams })
    }

    return <Card style={{ flexShrink: '0' }}>
        <CardContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: "10px", alignItems: 'center' }}>
                    {call.template.sampleImage ? <img
                        src={imageUrl(call.template.sampleImage)}
                        style={{ width: "36px", objectFit: 'cover', height: '36px', borderRadius: '2px' }}
                    /> : <div style={{
                        width: '36px', height: '36px', borderRadius: '2px', backgroundColor: "#2F2F2F",
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Assignment fontSize="small" />
                    </div>}
                    <div>
                        <div style={{ fontWeight: "600" }}>{call.template.name}</div>
                        <div style={{ fontSize: ".7em", opacity: '.7' }}>{call.fullMatch}</div>
                    </div>
                </div>
                <Tooltip title="Delete this template call">
                    <IconButton size="small" onClick={deleteSelf}>
                        <Delete fontSize="small" />
                    </IconButton>
                </Tooltip>
            </div>
            <hr />
            <table style={{ width: '100%' }}>
                <tbody>
                    {call.template.params.map((a, i) =>

                        <tr>
                            <td style={{ width: "25%" }}>
                                <div style={{ marginRight: '10px' }}>
                                    {a.name}
                                </div>
                            </td>
                            <td><TextField
                                value={internalParams[i] ?? ""}
                                placeholder={a.default}
                                onChange={(e) => updateCallParam(i, e.target.value)}
                                onBlur={() => syncCallParams()}
                                fullWidth
                            /></td>
                        </tr>
                    )}

                </tbody>
            </table>
        </CardContent>
    </Card>
}

export function VariableEditorRow(props: {
    varName: string,
    value: string | undefined,
    updateValue: (val: string) => void
    availableValues?: string[]
}) {

    const { varName, updateValue, value, availableValues } = props

    return <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '200px' }}><b>{varName.replaceAll("%", "").replaceAll("!__", "").replaceAll("__", "")}</b></div>
        {(availableValues?.length ?? 0) > 0
            ? <Autocomplete
                id="free-solo-demo"
                freeSolo fullWidth
                options={availableValues ?? []}
                value={value} onChange={(_, val) => updateValue(val ?? "")}
                onInputChange={(_, val) => updateValue(val ?? "")}
                renderInput={(params) => <TextField {...params} />}
            />
            : <TextField value={value ?? ""} onChange={(e) => updateValue(e.target.value)} fullWidth />}
    </div>
}