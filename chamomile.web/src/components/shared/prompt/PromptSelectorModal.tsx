import { useEffect, useState } from "react";
import { deletePrompt, getPrompts, updatePrompt } from "../../../api/Prompts";
import { Prompt } from "../../../model/Prompt";
import useApi from "../../hooks/useApi";
import { Card, Dialog, DialogContent, DialogTitle, IconButton, InputAdornment, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Coffee, Delete, Edit, GridView, Search, ViewList } from "@mui/icons-material";
import PromptCard from "./PromptCard";
import AreYouSureModal from "../modals/AreYouSureModal";
import { useSnackbar } from "notistack";
import PromptEditorModal from "./PromptEditorModal";
import PromptReorderButton from "./PromptReorderButton";
import PromptTile from "./PromptTile";
import ContextMenu from "../ContextMenu";

export default function PromptSelectorModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void,
    onOk: (val: Prompt) => void
}) {

    const { onOk, open, setOpen } = props;
    const promptsApi = useApi(getPrompts);
    const delPromptApi = useApi(deletePrompt)
    const updatePromptApi = useApi(updatePrompt)
    const { enqueueSnackbar } = useSnackbar();

    const [query, setQuery] = useState("")
    const [tempQuery, setTempQuery] = useState("")
    const [delPrompt, setDelPrompt] = useState(undefined as undefined | Prompt)
    const [editPrompt, setEditPrompt] = useState(undefined as undefined | Prompt)
    const [viewMode, setViewMode] = useState("grid" as "grid" | "list")

    const onDelete = () => {
        delPromptApi.fetch(() => {
            promptsApi.fetch();
            setDelPrompt(undefined)
            enqueueSnackbar("Prompt deleted!", { variant: 'success' })
        }, () => {
            enqueueSnackbar("Could not delete prompt!", { variant: 'error' })
        }, delPrompt?.id)
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
        <DialogTitle>Select a Recipe</DialogTitle>
        <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: "75vh" }}>
            <div style={{ display: 'flex', gap: '10px' }}>
                <TextField
                    value={tempQuery} onChange={(e) => setTempQuery(e.target.value)} onBlur={() => setQuery(tempQuery)}
                    placeholder="Search" fullWidth
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }}
                />
                <ToggleButtonGroup value={viewMode} onChange={(_, view) => { setViewMode(view) }} exclusive>
                    <ToggleButton value={"grid"}><GridView /></ToggleButton>
                    <ToggleButton value={"list"}><ViewList /></ToggleButton>
                </ToggleButtonGroup>

            </div>
            <div style={{ flex: '1', overflowY: 'auto' }}>
                {viewMode === "list"
                    ? <ListViewMode data={promptsApi.data} onOk={onOk} query={query} setDelPrompt={setDelPrompt} setEditPrompt={setEditPrompt} />
                    : <GridViewMode data={promptsApi.data} onOk={onOk} query={query} setDelPrompt={setDelPrompt} setEditPrompt={setEditPrompt} />
                }
            </div>

        </DialogContent>

        <AreYouSureModal open={!!delPrompt} setOpen={() => setDelPrompt(undefined)} onYes={onDelete} loading={delPromptApi.loading} title="Delete this prompt?">
            <PromptCard prompt={delPrompt ?? { name: '', positivePrompt: '' } as Prompt} onClick={() => { }} />
        </AreYouSureModal>
        <PromptEditorModal
            open={!!editPrompt} setOpen={() => setEditPrompt(undefined)}
            onOk={onUpdate} prompt={editPrompt ?? {} as Prompt}
            title="Edit Recipe"
        />

    </Dialog>

}

function GridViewMode(props: { data: Prompt[], query: string, setEditPrompt: (val: Prompt) => void, setDelPrompt: (val: Prompt) => void, onOk: (val: Prompt) => void }) {
    const { data, query, setDelPrompt, setEditPrompt, onOk } = props


    
    return <div style={{
                display:'grid',
                gridTemplateColumns:`repeat(auto-fill, minmax(${'128'}px, 1fr))`,
                gap:'20px'
            }}>
                {data?.filter(a => query.trim().length === 0 ? true :
                a.name.toLowerCase().includes(query.toLowerCase()) ||
                a.positivePrompt.toLowerCase().includes(query.toLowerCase())
                ).map(a=> <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                    <ContextMenu options={[
                        {type:"custom", customContent:(onClose)=><PromptReorderButton prompt={a} menuButonMode onClick={onClose} />},
                        {type:'divider'},
                        {icon: <Edit/>, text:"Edit", onClick:() => setEditPrompt(a)},
                        {icon:<Delete/>, text:'Delete', onClick:() => setDelPrompt(a)}
                    ]}>
                        <PromptTile prompt={a} onClick={() => onOk(a)}/>
                    </ContextMenu>
                </div> )}
            </div>

}

function ListViewMode(props: { data: Prompt[], query: string, setEditPrompt: (val: Prompt) => void, setDelPrompt: (val: Prompt) => void, onOk: (val: Prompt) => void }) {

    const { data, query, setDelPrompt, setEditPrompt, onOk } = props

    return <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
        {
            data?.filter(a => query.trim().length === 0 ? true :
                a.name.toLowerCase().includes(query.toLowerCase()) ||
                a.positivePrompt.toLowerCase().includes(query.toLowerCase())
            )
                .map(a => <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Card style={{ display: 'flex', flexDirection: 'column', width: '60px', flexShrink: '0', alignItems: "center", justifyContent: 'center', gap: '5px', padding: "10px 0px" }}>
                        <PromptReorderButton prompt={a} />
                        <IconButton onClick={() => setEditPrompt(a)}><Edit /></IconButton>
                        <IconButton onClick={() => setDelPrompt(a)}><Delete /></IconButton>
                    </Card>
                    <div style={{ flex: '1' }}><PromptCard onClick={() => onOk(a)} prompt={a} /></div>
                </div>)
        }
    </div>

}