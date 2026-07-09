import { useEffect, useMemo, useRef, useState } from "react";
import { deletePrompt, getPrompts, updatePrompt } from "../../../api/Prompts";
import { Prompt } from "../../../model/Prompt";
import useApi from "../../hooks/useApi";
import { Card, CardActionArea, CardContent, Dialog, DialogContent, DialogTitle, InputAdornment, TextField } from "@mui/material";
import { ArrowUpward, Coffee, Delete, Edit, Folder, ImageSearch, Search, Whatshot } from "@mui/icons-material";
import PromptCard from "./PromptCard";
import AreYouSureModal from "../modals/AreYouSureModal";
import { useSnackbar } from "notistack";
import PromptEditorModal from "./PromptEditorModal";
import PromptReorderButton from "./PromptReorderButton";
import PromptTile from "./PromptTile";
import ContextMenu from "../ContextMenu";
import { usePrompt } from "../../hooks/usePrompt";
import { clearFilter } from "../Utils";
import { FilterOptions } from "../../../model/FilterOptions";
import CopyToClipboardButton from "../copybutton/CopyToClipboardButton";
import useWaiter, { WaiterOrder } from "../../hooks/useWaiter";
import useModifierKeys from "../../hooks/useModifierKeys";

export default function PromptSelectorModal(props: {
    open: boolean,
    filter?: FilterOptions,
    setFilter?: (val: FilterOptions) => void
    setOpen: (val: boolean) => void,
    onOk: (val: Prompt) => void
}) {

    const { onOk, open, setOpen, filter, setFilter } = props;
    const promptsApi = useApi(getPrompts);
    const delPromptApi = useApi(deletePrompt)
    const updatePromptApi = useApi(updatePrompt)
    const { enqueueSnackbar } = useSnackbar();
    const { onBrew } = useWaiter(true);


    const searchRef = useRef<HTMLInputElement>(null);

    const [query, setQuery] = useState("")
    const [delPrompt, setDelPrompt] = useState(undefined as undefined | Prompt)
    const [promptFolder, setPromptFolder] = useState(undefined as undefined | string)
    const [rushFolder, setRushFolder] = useState(false)
    const [editPrompt, setEditPrompt] = useState(undefined as undefined | Prompt)
    const [currLocation, setCurrLocation] = useState("")

    const filteredData = useMemo(() => {

        if (!promptsApi.data) return []
        if (!query || query.trim().length === 0) return promptsApi.data

        return promptsApi.data?.filter(a => query.trim().length === 0 ? true :
            a.name.toLowerCase().substring(a.name.lastIndexOf("/")).includes(query.toLowerCase())
        )
    }, [promptsApi.data, query])

    const { prompt, setPrompt, orderAmount } = usePrompt();
    const promptFolderPrompts = promptFolder ? promptsApi.data.filter(a => a.name.startsWith(promptFolder + '/')) : []

    const onDelete = () => {
        delPromptApi.fetch(() => {
            promptsApi.fetch();

            //clear the prompt id if it matches
            if (prompt.id === delPrompt?.id) {
                setPrompt({ ...prompt, id: -1 })
            }
            setDelPrompt(undefined)
            enqueueSnackbar("Prompt deleted!", { variant: 'success' })
        }, () => {
            enqueueSnackbar("Could not delete prompt!", { variant: 'error' })
        }, delPrompt?.id)
    }


    const onPromptFolder = () => {
        setPromptFolder(undefined)
        onBrew({
            prompt: promptFolderPrompts,
            source: "SAVED_PROMPT",
            rush: rushFolder
        })
    }

    const onUpdate = (val: Prompt) => {
        updatePromptApi.fetch(() => {
            promptsApi.fetch();
            setEditPrompt(undefined)
            enqueueSnackbar("Prompt Updated!", { variant: 'success' })
        }, () => {
            enqueueSnackbar("Could not update prompt!", { variant: 'error' })
        }, val)
    }

    useEffect(() => {
        if (open) {
            promptsApi.fetch()
            setQuery("")
        }
    }, [open])

    useEffect(() => {
        if (open && searchRef.current) {
            searchRef.current?.focus();
        }
    }, [open, searchRef.current])

    // Get prompts and folders that start with currLocation
    const promptsBelowCurrentLevel = useMemo(() => {
        if (!promptsApi.data) return undefined
        return promptsApi.data?.filter(p => currLocation.length === 0 ? true : p.name.startsWith(currLocation + "/"))
    }, [promptsApi.data, currLocation]);

    // Prompts at this level: no further slashes after currLocation
    const currLocationPrompts = useMemo(() => {
        if (!promptsBelowCurrentLevel) return []
        return promptsBelowCurrentLevel?.filter(p => {
            const rest = p.name.slice(currLocation.length + 1);
            return !rest.includes("/") && rest.length > 0;
        })
    }, [promptsBelowCurrentLevel]);

    // Folders at this level: next segment after currLocation before a slash

    const folders = useMemo(() => {
        if (!promptsBelowCurrentLevel || promptsBelowCurrentLevel.length === 0) return []
        const folderSet = new Set<string>();
        promptsBelowCurrentLevel?.forEach(p => {
            const rest = p.name?.slice(currLocation.length === 0 ? 0 : currLocation.length + 1);
            const match = rest?.match(/^([^\/]+)\//);
            if (match) {
                folderSet.add(match[1]);
            }
        });

        return Array.from(folderSet);
    }, [promptsBelowCurrentLevel])


    return <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='lg'>
        <DialogTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                {query ? 'Search results' : currLocation ? `/${currLocation}` : "Saved Recipes"}
            </div>
            <div style={{ opacity: .8, fontSize: '0.7em', fontWeight: 'normal' }}>
                {query ? `${filteredData.length} recipe(s)` : <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {/* <div>
                        {promptsBelowCurrentLevel?.length ?? 0} Recipe(s) as
                    </div> */}
                    <div style={{ fontSize: ".6rem" }}>
                        {
                            currLocationPrompts?.length > 0 && <div>
                                {currLocationPrompts?.length ?? 0} Recipe(s)
                            </div>
                        }
                        {folders?.length > 0 && (
                            <div>
                                {folders.length} Folder(s)
                            </div>
                        )}
                    </div>
                </div>}
            </div>

        </DialogTitle>
        <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: "75vh" }}>
            <div style={{ display: 'flex', gap: '10px' }}>
                <TextField
                    inputRef={searchRef}
                    value={query} onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search" fullWidth
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }}
                />
            </div>
            <div style={{ flex: '1', overflowY: 'auto' }}>
                <GridViewMode
                    onOk={onOk} query={query}
                    setDelPrompt={setDelPrompt} setEditPrompt={setEditPrompt} setRushFolder={setRushFolder}
                    setPromptFolder={setPromptFolder} filter={filter} setFilter={setFilter}
                    currLocation={currLocation} setCurrLocation={setCurrLocation}
                    filteredData={filteredData} currLocationPrompts={currLocationPrompts}
                    folders={folders} onBrew={onBrew}
                />
            </div>

        </DialogContent>

        <AreYouSureModal open={!!delPrompt} setOpen={() => setDelPrompt(undefined)} onYes={onDelete} loading={delPromptApi.loading} title="Delete this recipe?">
            <PromptCard prompt={delPrompt ?? { name: '', positivePrompt: '' } as Prompt} onClick={() => { }} />
        </AreYouSureModal>



        <AreYouSureModal open={!!promptFolder} setOpen={() => setPromptFolder(undefined)} onYes={onPromptFolder} title={`${rushFolder ? "Rush o" : "O"}rder all under ${promptFolder}?`}>
            This will order {promptFolderPrompts?.length?.toLocaleString()} recipe(s) including:
            <ul style={{ maxHeight: "50vh", overflowY: 'auto' }}>
                {promptFolderPrompts.map(a => <li>{a.name}</li>)}
            </ul>
            Each will be ordered {orderAmount} times for a total of {(promptFolderPrompts?.length * orderAmount)?.toLocaleString()} orders
        </AreYouSureModal>

        <PromptEditorModal
            open={!!editPrompt} setOpen={() => setEditPrompt(undefined)}
            onOk={onUpdate} prompt={editPrompt ?? {} as Prompt}
            title="Edit Recipe"
        />

    </Dialog>

}

function GridViewMode(props: {
    query: string,
    setEditPrompt: (val: Prompt) => void,
    setPromptFolder: (val: string) => void,
    setRushFolder: (val: boolean) => void
    setDelPrompt: (val: Prompt) => void,
    onOk: (val: Prompt) => void,
    filter?: FilterOptions,
    setFilter?: (val: FilterOptions) => void
    currLocation: string,
    setCurrLocation: (val: string) => void
    filteredData?: Prompt[]
    folders?: string[],
    currLocationPrompts?: Prompt[],
    onBrew: (order: WaiterOrder) => void
}) {
    const {
        query, setDelPrompt, setEditPrompt, onOk, setPromptFolder, setRushFolder,
        filter, setFilter, currLocation, setCurrLocation, filteredData,
        folders, currLocationPrompts, onBrew
    } = props

    const { shiftHeld } = useModifierKeys();


    // If we have a query, we just show the results
    if ((query?.trim().length ?? 0) !== 0) {
        return <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, minmax(${'128'}px, 1fr))`,
            gap: '20px'
        }}>
            {filteredData?.map(a => <div key={a.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <ContextMenu options={[
                    { type: "custom", customContent: (onClose) => <PromptReorderButton prompt={a} source="SAVED_PROMPT" menuButonMode onClick={onClose} /> },
                    { type: 'divider' },
                    filter && setFilter && (a.sampleImage ?? 0) > 0 ? { icon: <ImageSearch />, text: "Images like this", onClick: () => setFilter({ ...clearFilter(filter), sample: a.sampleImage }) } : undefined,
                    { type: "custom", customContent: () => <CopyToClipboardButton text={a.positivePrompt} menuButonMode /> },
                    { type: 'divider' },
                    { icon: <Edit />, text: "Edit", onClick: () => setEditPrompt(a) },
                    { icon: <Delete />, text: 'Delete', onClick: () => setDelPrompt(a) }
                ]}>
                    <PromptTile prompt={a} onClick={() => onOk(a)} onMiddleClick={() => {
                        onBrew({
                            prompt: a,
                            source: "SAVED_PROMPT",
                            rush: shiftHeld
                        })
                    }} />
                </ContextMenu>
            </div>)}

        </div>
    }


    return <>
        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, minmax(${'128'}px, 1fr))`,
            gap: '20px', marginBottom: folders?.length === 0 && currLocation.length === 0 ? "" : "20px"
        }}>

            {/* Up one level card */}
            {currLocation.length > 0 && <Card>
                <CardActionArea onClick={() => setCurrLocation(currLocation.includes("/") ? currLocation.split("/").slice(0, -1).join("/") : "")}>
                    <CardContent style={{ display: 'flex', gap: "5px", alignItems: "center" }}>
                        <ArrowUpward fontSize="small" />
                        <div>{currLocation.includes("/") ? currLocation.split("/").slice(0, -1).join("/") : "Root"}</div>
                    </CardContent>
                </CardActionArea>
            </Card>}

            {/* Folders */}
            {folders?.map(a => <div key={a} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <ContextMenu options={[
                    {
                        icon: shiftHeld ? <Whatshot /> : <Coffee />, text: `${shiftHeld ? "Rush o" : "O"}rder all`, onClick: () => {
                            setPromptFolder((currLocation.length > 0 ? currLocation + "/" : "") + a)
                            setRushFolder(shiftHeld)
                        }
                    }
                ]}>
                    <Card>
                        <CardActionArea onClick={() => setCurrLocation(currLocation.length === 0 ? a : currLocation + "/" + a)}>
                            <CardContent style={{ display: 'flex', gap: "5px", alignItems: "center" }}>
                                <Folder fontSize="small" />
                                <div>{a}</div>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </ContextMenu>
            </div>)}
        </div>

        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, minmax(${'128'}px, 1fr))`,
            gap: '20px'
        }}>
            {currLocationPrompts?.map(a => <div key={a.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <ContextMenu options={[
                    { type: "custom", customContent: (onClose) => <PromptReorderButton prompt={a} source="SAVED_PROMPT" menuButonMode onClick={onClose} /> },
                    { type: 'divider' },
                    filter && setFilter && (a.sampleImage ?? 0) > 0 ? { icon: <ImageSearch />, text: "Images like this", onClick: () => setFilter({ ...clearFilter(filter), sample: a.sampleImage }) } : undefined,
                    { type: "custom", customContent: () => <CopyToClipboardButton text={a.positivePrompt} menuButonMode /> },
                    { type: 'divider' },
                    { icon: <Edit />, text: "Edit", onClick: () => setEditPrompt(a) },
                    { icon: <Delete />, text: 'Delete', onClick: () => setDelPrompt(a) }
                ]}>
                    <PromptTile prompt={a} onClick={() => onOk(a)} onMiddleClick={() => {
                        onBrew({
                            prompt: a,
                            source: "SAVED_PROMPT",
                            rush: shiftHeld
                        })
                    }} />
                </ContextMenu>
            </div>)}

        </div>

    </>



}