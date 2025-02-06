import { Dialog, DialogContent, DialogTitle, InputAdornment, TextField } from "@mui/material"
import { usePrompt } from "../../hooks/usePrompt"
import { Terminal } from "@mui/icons-material"
import { availableVars, hydratePrompt } from "../Utils"

export default function VariableEditor(props:{
    open: boolean,
    setOpen: (val:boolean) => void
}){

    const {open,setOpen} = props
    const {variables, setVairables, prompt} = usePrompt()

    const varNames = availableVars(prompt)

    return <Dialog open={open} onClose={()=>setOpen(false)} fullWidth maxWidth='md'>
        <DialogTitle>Variables</DialogTitle>
        <DialogContent style={{display:'flex', flexDirection:'column', height:'75vh'}}>
            <div style={{marginBottom:'10px'}}><b>Prompt Preview</b></div>
            <div style={{padding:"10px", background:'#222', fontSize:'.9em', fontFamily:'monospace'}}>
            <TextField
                value={hydratePrompt(prompt,variables).positivePrompt} disabled multiline maxRows={7}
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
            <hr style={{width:"100%"}}/>
            <div style={{flex:'1', display:'flex', flexDirection:'column', gap:'10px', overflowY:'auto'}}>
                {varNames.length===0 ? <div style={{height:"100%", display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                    <div style={{fontSize:'2.5em'}}>%</div>
                    <div style={{fontSize:'1.3em'}}><b>There are no variables</b></div>
                    <hr style={{width:'300px'}}/>
                    <div style={{width:"250px", textAlign:'center', fontSize:'.8em'}}>Add a variable by putting an identifier between percentages (%MyVar%)</div>
                </div> : varNames.map(a=><VariableEditorRow varName={a} value={variables[a]} updateValue={(val)=>{
                    setVairables({...variables,[a]: val})
                }}/>) }

            </div>
        </DialogContent>
    </Dialog>

}

export function VariableEditorRow(props:{
    varName:string,
    value:string|undefined,
    updateValue:(val:string)=>void
}){

    const {varName, updateValue,value} = props

    return <div style={{display:'flex', alignItems:'center'}}>
        <div style={{width:'200px'}}><b>{varName}</b></div>
        <TextField value={value ?? ""} onChange={(e)=>updateValue(e.target.value)} fullWidth/>
    </div>
}