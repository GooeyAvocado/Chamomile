import { Autocomplete, Button, IconButton, InputAdornment, TextField, Tooltip } from "@mui/material"
import { usePrompt } from "../../hooks/usePrompt"
import { promptPreview } from "../Utils"
import { Add, Delete, FileDownload, FileUpload, Terminal } from "@mui/icons-material"
import { useMemo, useState } from "react"
import { Prompt } from "../../../model/Prompt"
import useApi from "../../hooks/useApi"
import { getWildcards } from "../../../api/Prompts"
import TabbedModal from "../modals/TabbedModal/TabbedModal"
import TabbedModalTitle from "../modals/TabbedModal/TabbedModalTitle"
import TabbedModalConsistentContent from "../modals/TabbedModal/TabbedModalConsistentContent"
import TabbedModalActions from "../modals/TabbedModal/TabbedModalActions"
import TabbedModalTabContent from "../modals/TabbedModal/TabbedModalTabContent"
import { useWindowDimensions } from "../../hooks/useWindowDimensions"
import { useSnackbar } from "notistack"

export default function VariableEditor(props: {
    open: boolean,
    setOpen: (val: boolean) => void
}) {

    const { open, setOpen } = props
    const { variables, setVairables: setVariables, prompt, setPrompt } = usePrompt()

    const { enqueueSnackbar } = useSnackbar();

    const [newCustName, setNewCustName] = useState("")
    const [newWildName, setNewWildName] = useState("")

    const { width } = useWindowDimensions()

    const { data: wildcards } = useApi(getWildcards, true)

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

    const onExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(variables, null, 4));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "variables.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        try {
            const json = JSON.parse(text);
            if (typeof json === "object" && json !== null) {
                enqueueSnackbar("Overrides loaded!", { variant: "success" });
                setVariables(json);
            } else {
                enqueueSnackbar("Invalid JSON format.", { variant: "warning" });
            }
        } catch {
            enqueueSnackbar("Failed to parse JSON.", { variant: 'error' });
        }
        e.target.value = "";
    }

    const varNames = availableVars(prompt)
    const wildNames = availableWildcards(prompt)
    const custNames = availableCustomNames()

    return <TabbedModal
        open={open} setOpen={setOpen} fullWidth maxWidth="md" titleTabStack={width < 700}
        contentStyle={{ display: 'flex', flexDirection: 'column', height: '75vh' }}
        tabContentStyle={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}
    >
        <TabbedModalTitle>Variables and Overrides</TabbedModalTitle>
        <TabbedModalConsistentContent position="top">
            <div style={{ padding: "10px", background: '#222', fontSize: '.9em', fontFamily: 'monospace' }}>
                <TextField
                    value={promptPreview(prompt, variables)} disabled multiline maxRows={7}
                    fullWidth slotProps={{
                        htmlInput: { style: { fontSize: '.8em', fontFamily: 'monospace' } },
                        input: {
                            startAdornment: (
                                <InputAdornment position="start"> <Terminal /> </InputAdornment>
                            )
                        }
                    }}
                />
            </div>
            <hr style={{ width: "100%", marginBottom: '20px' }} />
        </TabbedModalConsistentContent>
        <TabbedModalTabContent label="Variables">
            {
                varNames.length === 0 ? <div style={{ height: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ fontSize: '2.5em' }}>%</div>
                    <div style={{ fontSize: '1.3em' }}><b>There are no variables</b></div>
                    <hr style={{ width: '300px' }} />
                    <div style={{ width: "250px", textAlign: 'center', fontSize: '.8em' }}>Add a variable by putting an identifier between percentages (%MyVar%)</div>
                </div> : varNames.map(a => <VariableEditorRow varName={a} value={variables[a]} updateValue={(val) => {
                    setVariables({ ...variables, [a]: val })
                }} />)
            }
        </TabbedModalTabContent>
        <TabbedModalTabContent label="Wildcards" >
            {wildNames.map(a => <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
            {custNames.map(a => <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
        <TabbedModalActions>
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', paddingBottom: '5px', paddingLeft: '5px', paddingRight: '5px' }}>
                <div style={{ display: 'flex', gap: '5px' }}>

                    <Tooltip title="Import overrides">
                        <IconButton component="label" color="primary" >
                            <FileUpload />
                            <input type="file" accept="application/json" hidden onChange={onImport} />
                        </IconButton>
                    </Tooltip>

                    {Object.keys(variables ?? {}).length > 0 && <>

                        <hr />

                        <Tooltip title="Export overrides">
                            <IconButton onClick={onExport} color="primary">
                                <FileDownload />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Clear all overrides">
                            <IconButton onClick={() => setVariables({})} color="primary"><Delete /></IconButton>
                        </Tooltip>
                    </>}
                </div>
                <Button onClick={() => setOpen(false)}>OK</Button>
            </div>
        </TabbedModalActions>

    </TabbedModal>
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