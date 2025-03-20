import { IconButton, ListItemIcon, MenuItem, Tooltip } from "@mui/material";
import { Prompt } from "../../../model/Prompt";
import { usePingPong } from "../../hooks/usePingPong";
import { usePrompt } from "../../hooks/usePrompt";
import { Coffee } from "@mui/icons-material";
import { hydratePrompt } from "../Utils";
import { enqueuePrompts } from "../../../api/Images";
import useApi from "../../hooks/useApi";
import { useSnackbar } from "notistack";

export default function PromptReorderButton(props:{
    prompt:Prompt,
    iconOverride?: React.ReactNode
    menuButonMode?:boolean
    onClick?:()=>void
}){

    const {prompt,menuButonMode,onClick,iconOverride} = props
    const {orderAmount, variables} = usePrompt()
    const brewApi = useApi(enqueuePrompts)
    const {enqueueSnackbar} = useSnackbar();
    
    const {pong} = usePingPong()

    const onBrew = () => {
        const allPrompts = []
        for (let index = 0; index < orderAmount; index++) {
            allPrompts.push(hydratePrompt(prompt,variables, index));
        }

        brewApi.fetch((val) => {
            if(orderAmount!==val?.jobIds.length){
                enqueueSnackbar(`Only ${val?.jobIds.length} orders placed!`, { variant: 'warning' })
            } else {
                enqueueSnackbar(`${val?.jobIds.length} orders placed!`, { variant: 'success' })
            }
            
        }, () => {
            enqueueSnackbar("Could not queue images!", { variant: 'error' })
        }, allPrompts)
    }

    if(!pong?.SD||!prompt) return <></>
    if(menuButonMode) {
        return <MenuItem onClick={()=>{
            onBrew();
            onClick?.()
        }}>
            <ListItemIcon>{iconOverride ?? <Coffee/>}</ListItemIcon>
            Brew {orderAmount} more
        </MenuItem>
    }
    return <Tooltip title={<>
            <div>Reorder this prompt with the current model</div>
            <div>This will place {orderAmount} order(s)</div>    
        </>}>
        <IconButton onClick={()=>{
            onBrew();
            onClick?.()
        }}>
        {iconOverride ?? <Coffee/>}
    </IconButton>
    </Tooltip>

}