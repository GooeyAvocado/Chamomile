import { useEffect, useState } from "react";
import { deletePrompt, getPrompts, updatePrompt } from "../../../api/Prompts";
import { Prompt } from "../../../model/Prompt";
import useApi from "../../hooks/useApi";
import { Card, CardActionArea, CardContent, Dialog, DialogContent, DialogTitle, InputAdornment, TextField } from "@mui/material";
import { ArrowUpward, Coffee, Delete, Edit, Folder, ImageSearch, Search } from "@mui/icons-material";
import PromptCard from "./PromptCard";
import AreYouSureModal from "../modals/AreYouSureModal";
import { useSnackbar } from "notistack";
import PromptEditorModal from "./PromptEditorModal";
import PromptReorderButton from "./PromptReorderButton";
import PromptTile from "./PromptTile";
import ContextMenu from "../ContextMenu";
import { usePrompt } from "../../hooks/usePrompt";
import { enqueuePrompts } from "../../../api/Images";
import { clearFilter, hydratePrompt } from "../Utils";
import { useSettings } from "../../hooks/useSettings";
import { FilterOptions } from "../../../model/FilterOptions";

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
    const brewApi = useApi(enqueuePrompts)
    const { settings } = useSettings();

    const [query, setQuery] = useState("")
    const [delPrompt, setDelPrompt] = useState(undefined as undefined | Prompt)
    const [promptFolder, setPromptFolder] = useState(undefined as undefined | string)
    const [editPrompt, setEditPrompt] = useState(undefined as undefined | Prompt)

    const { prompt, setPrompt, orderAmount, album, variables } = usePrompt();

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
        const orderPrompts = [] as Prompt[]
        const allPrompts = [...promptFolderPrompts]
        allPrompts.forEach((p) => {
            for (let index = 0; index < orderAmount; index++) {
                orderPrompts.push(hydratePrompt({
                    ...p, ...{
                        cfgScale: settings.globals.cfg ? prompt.cfgScale : p.cfgScale,
                        sampler: settings.globals.sampler ? prompt.sampler : p.sampler,
                        steps: settings.globals.steps ? prompt.steps : p.steps,
                        width: settings.globals.width ? prompt.width : p.width,
                        height: settings.globals.height ? prompt.height : p.height

                    }, orderData: {
                        sample: p.sampleImage ?? -1,
                        source: "SAVED_PROMPT",
                        albums: album?.id ? [album?.id] : []
                    }
                }, variables, index));
            }
        })

        brewApi.fetch((val) => {
            enqueueSnackbar(`${val?.jobIds.length} orders placed!`, { variant: 'success' })
            setPromptFolder(undefined)
        }, () => {
            enqueueSnackbar("Could not queue images!", { variant: 'error' })
        }, orderPrompts)


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


    return <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='lg'>
        <DialogTitle>{promptsApi.data?.length} Recipes</DialogTitle>
        <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: "75vh" }}>
            <div style={{ display: 'flex', gap: '10px' }}>
                <TextField
                    value={query} onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search" fullWidth
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }}
                />
            </div>
            <div style={{ flex: '1', overflowY: 'auto' }}>
                <GridViewMode
                    data={promptsApi.data} onOk={onOk} query={query}
                    setDelPrompt={setDelPrompt} setEditPrompt={setEditPrompt}
                    setPromptFolder={setPromptFolder} filter={filter} setFilter={setFilter}
                />
            </div>

        </DialogContent>

        <AreYouSureModal open={!!delPrompt} setOpen={() => setDelPrompt(undefined)} onYes={onDelete} loading={delPromptApi.loading} title="Delete this prompt?">
            <PromptCard prompt={delPrompt ?? { name: '', positivePrompt: '' } as Prompt} onClick={() => { }} />
        </AreYouSureModal>



        <AreYouSureModal open={!!promptFolder} setOpen={() => setPromptFolder(undefined)} onYes={onPromptFolder} loading={brewApi.loading} title={`Prompt all under ${promptFolder}?`}>
            This will prompt {promptFolderPrompts.length} prompt(s) including:
            <ul style={{ maxHeight: "50vh", overflowY: 'auto' }}>
                {promptFolderPrompts.map(a => <li>{a.name}</li>)}
            </ul>
            Each will be prompted {orderAmount} times for a total of {promptFolderPrompts.length * orderAmount} images
        </AreYouSureModal>

        <PromptEditorModal
            open={!!editPrompt} setOpen={() => setEditPrompt(undefined)}
            onOk={onUpdate} prompt={editPrompt ?? {} as Prompt}
            title="Edit Recipe"
        />

    </Dialog>

}

function GridViewMode(props: {
    data: Prompt[], query: string,
    setEditPrompt: (val: Prompt) => void,
    setPromptFolder: (val: string) => void,
    setDelPrompt: (val: Prompt) => void,
    onOk: (val: Prompt) => void,
    filter?: FilterOptions,
    setFilter?: (val: FilterOptions) => void
}) {
    const { data, query, setDelPrompt, setEditPrompt, onOk, setPromptFolder, filter, setFilter } = props

    const [currLocation, setCurrLocation] = useState("")


    // Get prompts and folders that start with currLocation
    const matching = data?.filter(p => currLocation.length === 0 ? true : p.name.startsWith(currLocation + "/"));

    // Prompts at this level: no further slashes after currLocation
    const currPrompts = matching?.filter(p => {
        const rest = p.name.slice(currLocation.length + 1);
        return !rest.includes("/") && rest.length > 0;
    });

    // Folders at this level: next segment after currLocation before a slash

    const folders = () => {
        if (!matching || matching.length === 0) return []
        const folderSet = new Set<string>();
        matching?.forEach(p => {
            const rest = p.name?.slice(currLocation.length === 0 ? 0 : currLocation.length + 1);
            const match = rest?.match(/^([^\/]+)\//);
            if (match) {
                folderSet.add(match[1]);
            }
        });

        return Array.from(folderSet);
    }

    if ((query?.trim().length ?? 0) !== 0) {
        return <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, minmax(${'128'}px, 1fr))`,
            gap: '20px'
        }}>
            {data?.filter(a => query.trim().length === 0 ? true :
                a.name.toLowerCase().includes(query.toLowerCase()) ||
                a.positivePrompt.toLowerCase().includes(query.toLowerCase())
            ).map(a => <div key={a.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <ContextMenu options={[
                    { type: "custom", customContent: (onClose) => <PromptReorderButton prompt={a} sample={a.sampleImage} source="SAVED_PROMPT" menuButonMode onClick={onClose} /> },
                    { type: 'divider' },
                    filter && setFilter && (a.sampleImage ?? 0) > 0 ? { icon: <ImageSearch />, text: "Images like this", onClick: () => setFilter({ ...clearFilter(filter), sample: a.sampleImage }) } : undefined,
                    filter && setFilter && (a.sampleImage ?? 0) ? { type: 'divider' } : undefined,
                    { icon: <Edit />, text: "Edit", onClick: () => setEditPrompt(a) },
                    { icon: <Delete />, text: 'Delete', onClick: () => setDelPrompt(a) }
                ]}>
                    <PromptTile prompt={a} onClick={() => onOk(a)} />
                </ContextMenu>
            </div>)}

        </div>
    }

    const folderList = folders();

    return <>
        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, minmax(${'128'}px, 1fr))`,
            gap: '20px', marginBottom: folderList?.length === 0 && currLocation.length === 0 ? "" : "20px"
        }}>
            {currLocation.length > 0 && <Card>
                <CardActionArea onClick={() => setCurrLocation(currLocation.includes("/") ? currLocation.split("/").slice(0, -1).join("/") : "")}>
                    <CardContent style={{ display: 'flex', gap: "5px", alignItems: "center" }}>
                        <ArrowUpward fontSize="small" />
                        <div>{currLocation.includes("/") ? currLocation.split("/").slice(0, -1).join("/") : "Root"}</div>
                    </CardContent>
                </CardActionArea>
            </Card>}
            {folderList?.map(a => <div key={a} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <ContextMenu options={[
                    { icon: <Coffee />, text: 'Prompt all', onClick: () => setPromptFolder((currLocation.length > 0 ? currLocation + "/" : "") + a) }
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
            {currPrompts?.map(a => <div key={a.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <ContextMenu options={[
                    { type: "custom", customContent: (onClose) => <PromptReorderButton prompt={a} sample={a.sampleImage} source="SAVED_PROMPT" menuButonMode onClick={onClose} /> },
                    { type: 'divider' },
                    filter && setFilter && (a.sampleImage ?? 0) > 0 ? { icon: <ImageSearch />, text: "Images like this", onClick: () => setFilter({ ...clearFilter(filter), sample: a.sampleImage }) } : undefined,
                    filter && setFilter && (a.sampleImage ?? 0) ? { type: 'divider' } : undefined,
                    { icon: <Edit />, text: "Edit", onClick: () => setEditPrompt(a) },
                    { icon: <Delete />, text: 'Delete', onClick: () => setDelPrompt(a) }
                ]}>
                    <PromptTile prompt={a} onClick={() => onOk(a)} />
                </ContextMenu>
            </div>)}

        </div>

    </>



}