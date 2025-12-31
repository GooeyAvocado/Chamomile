import { Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, ListItemIcon, MenuItem, Tooltip } from "@mui/material";
import { Prompt } from "../../../model/Prompt";
import { usePingPong } from "../../hooks/usePingPong";
import { usePrompt } from "../../hooks/usePrompt";
import { Coffee, Warning } from "@mui/icons-material";
import { imageUrl } from "../../../api/Images";
import useWaiter from "../../hooks/useWaiter";

export default function PromptReorderButton(props: {
    prompt: Prompt,
    iconOverride?: React.ReactNode
    menuButonMode?: boolean
    textSuffix?: string
    disabled?: boolean
    onClick?: () => void
    source?: "IMAGE_BASE" | "IMAGE" | "SAVED_PROMPT"
    sample?: number
}) {

    const { prompt, menuButonMode, onClick, iconOverride, textSuffix, disabled, sample, source } = props

    const { orderAmount } = usePrompt()
    const { pong } = usePingPong()

    const {
        onBrew: onRealBrew, unavailLoraWarn, unavailLoras, setUnavailLoraWarn
    } = useWaiter(!menuButonMode);


    const onBrew = (override?: Prompt) => {
        onRealBrew(override ?? prompt, sample, source, !!override)
    }

    if (!pong?.SD || !prompt) return <></>

    return <>
        {
            menuButonMode ? <MenuItem disabled={disabled} onClick={() => {
                onBrew();
                onClick?.()
            }}>
                <ListItemIcon>{iconOverride ?? <Coffee />}</ListItemIcon>
                Brew {orderAmount} {textSuffix}
            </MenuItem>
                : <Tooltip title={<>
                    <div>Reorder this prompt</div>
                    <div>This will place {orderAmount} order(s)</div>
                    {textSuffix && <div>{textSuffix}</div>}
                </>}>
                    <IconButton disabled={disabled} onClick={() => {
                        onBrew();
                        onClick?.()
                    }}>
                        {iconOverride ?? <Coffee />}
                    </IconButton>
                </Tooltip>
        }

        <Dialog open={unavailLoraWarn} onClose={() => setUnavailLoraWarn(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
                <div style={{ display: 'flex', gap: "10px", alignItems: 'center' }}>
                    <Warning color="warning" />
                    <div>There are unavailable LoRAs on this prompt</div>
                </div>
            </DialogTitle>
            <DialogContent>
                <div>
                    Chamomile was unable to find the following LoRAs mentioned on this prompt:
                </div>
                <div style={{ margin: "10px 0px", display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {unavailLoras.map((a) => <div style={{ display: 'flex' }}>
                        <Card key={a.text} style={{ display: "flex", padding: "2px 5px", alignItems: 'center', gap: "5px" }} elevation={2}>
                            <img src={a.lora?.bannerImage ? imageUrl(a.lora?.bannerImage) : "/color.png"} width={16} />
                            <div>{a.text}</div>
                        </Card>
                    </div>)}
                </div>
                <div style={{ fontSize: ".8em" }}>
                    A1111 will not load any LoRAs if one fails to load. However, it's possible these LoRAs may exist, either because the
                    alias is a filename, or if your LoRAs have not been refreshed to reflect that they are now available.
                </div>
                <div style={{ marginTop: "10px" }}>
                    What would you like to do?
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {

                    let pPrompt = prompt.positivePrompt;
                    unavailLoras.forEach(a => pPrompt = pPrompt.replaceAll(a.text, ""))

                    onBrew({ ...prompt, positivePrompt: pPrompt })
                    setUnavailLoraWarn(false)

                }}>Prompt without these</Button>
                <Button onClick={() => {
                    onBrew(prompt)
                    setUnavailLoraWarn(false)
                }}>Prompt as is</Button>
                <Button onClick={() => setUnavailLoraWarn(false)}>Cancel</Button>
            </DialogActions>
        </Dialog>
    </>

}