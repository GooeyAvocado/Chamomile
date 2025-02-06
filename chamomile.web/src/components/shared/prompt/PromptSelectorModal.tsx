import { useEffect, useState } from "react";
import { deletePrompt, getPrompts, updatePrompt } from "../../../api/Prompts";
import { Prompt } from "../../../model/Prompt";
import useApi from "../../hooks/useApi";
import { Card, Dialog, DialogContent, DialogTitle, IconButton, InputAdornment, TextField } from "@mui/material";
import { Delete, Edit, Search } from "@mui/icons-material";
import PromptCard from "./PromptCard";
import AreYouSureModal from "../modals/AreYouSureModal";
import { useSnackbar } from "notistack";
import PromptEditorModal from "./PromptEditorModal";

export default function PromptSelectorModal(props:{
    open:boolean,
    setOpen:(val:boolean)=>void,
    onOk:(val:Prompt)=>void
}){

    const {onOk,open,setOpen} = props;
    const promptsApi = useApi(getPrompts);
    const delPromptApi = useApi(deletePrompt)
    const updatePromptApi = useApi(updatePrompt)
    const {enqueueSnackbar} = useSnackbar();
    
    const [query, setQuery] = useState("")
    const [tempQuery, setTempQuery] = useState("")
    const [delPrompt, setDelPrompt] = useState(undefined as undefined|Prompt)
    const [editPrompt, setEditPrompt] = useState(undefined as undefined|Prompt)

    const onDelete= ()=>{
        delPromptApi.fetch(()=>{
            promptsApi.fetch();
            setDelPrompt(undefined)
            enqueueSnackbar("Prompt deleted!",{variant:'success'})
        },()=>{
            enqueueSnackbar("Could not delete prompt!",{variant:'error'})
        },delPrompt?.id)
    }

    const onUpdate= (val:Prompt)=>{
        updatePromptApi.fetch(()=>{
            promptsApi.fetch();
            setEditPrompt(undefined)
            enqueueSnackbar("Prompt Updated!",{variant:'success'})
        },()=>{
            enqueueSnackbar("Could not update prompt!",{variant:'error'})
        },val)
    }

    useEffect(()=>{
        if(open){
            promptsApi.fetch()
            setQuery("")
        }
    },[open])

    return <Dialog open={open} onClose={()=>setOpen(false)} fullWidth maxWidth='lg'>
        <DialogTitle>Select a Recipe</DialogTitle>
        <DialogContent style={{display:'flex', flexDirection:'column', gap:'15px', height:"75vh"}}>
            <TextField 
                value={tempQuery} onChange={(e)=>setTempQuery(e.target.value)} onBlur={()=>setQuery(tempQuery)}
                placeholder="Search" fullWidth 
                slotProps={{input:{startAdornment:<InputAdornment position="start"><Search/></InputAdornment>}}}
            />
            {promptsApi.data?.filter(a=>query.trim().length=== 0 ? true : 
                a.name.toLowerCase().includes(query.toLowerCase()) ||
                a.positivePrompt.toLowerCase().includes(query.toLowerCase())
            )
                .map(a=><div style={{display:'flex', gap:'5px'}}>
                <Card style={{display:'flex',flexDirection:'column', width:'60px', flexShrink:'0', alignItems:"center", justifyContent:'center', gap:'20px'}}>
                    <IconButton onClick={()=>setEditPrompt(a)}><Edit/></IconButton>
                    <IconButton onClick={()=>setDelPrompt(a)}><Delete/></IconButton>
                </Card>
                <div style={{flex:'1'}}><PromptCard onClick={()=>onOk(a)} prompt={a}/></div>
            </div>)}
        </DialogContent>

        <AreYouSureModal open={!!delPrompt} setOpen={()=>setDelPrompt(undefined)} onYes={onDelete} loading={delPromptApi.loading} title="Delete this prompt?">
            <PromptCard prompt={delPrompt ?? {name:'', positivePrompt:''} as Prompt} onClick={()=>{}}/>
        </AreYouSureModal>
        <PromptEditorModal 
            open={!!editPrompt} setOpen={()=>setEditPrompt(undefined)}
            onOk={onUpdate} prompt={editPrompt ?? {} as Prompt} 
            title="Edit Recipe"
        />

    </Dialog>

}