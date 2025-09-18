import { Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, ListItemIcon, MenuItem, Tooltip } from "@mui/material";
import { Prompt } from "../../../model/Prompt";
import { usePingPong } from "../../hooks/usePingPong";
import { usePrompt } from "../../hooks/usePrompt";
import { Coffee, Warning } from "@mui/icons-material";
import { hydratePrompt } from "../Utils";
import { enqueuePrompts, imageUrl } from "../../../api/Images";
import useApi from "../../hooks/useApi";
import { useSnackbar } from "notistack";
import { useSettings } from "../../hooks/useSettings";
import { useState } from "react";
import { useLoras } from "../../hooks/useLoras";
import { Lora } from "../../../model/Lora";

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
    const { settings } = useSettings();

    const { prompt: promptboxPrompt, orderAmount, variables } = usePrompt()
    const brewApi = useApi(enqueuePrompts)
    const { enqueueSnackbar } = useSnackbar();
    const { album } = usePrompt();
    const { pong } = usePingPong()
    const { loras } = useLoras();

    const [unavailLoraWarn, setUnavailLoraWarn] = useState(false)
    const [unavailLoras, setUnavailLoras] = useState<{
        text: string,
        lora?: Lora
    }[]>([])

    const onBrew = (override?: Prompt) => {

        const p = override ?? prompt

        //CHECK are there any unknown or unavailable LoRAs
        //First get a list of all LoRAs on this prompt (re-do the regex in case there's LoRAs that are unknown)
        const loraRegex = /<lora:[^>]+>/g;
        const loraMatches = p.positivePrompt.match(loraRegex) || [];

        const unavail = loraMatches.map(a => {
            const loraAlias = a.match(/<lora:([^>]+):[^>]+>/)?.[1]
            return {
                text: a,
                lora: loras?.find(a => a.alias === loraAlias)
            }
        }).filter(a => !a.lora || !a.lora.isAvailable)

        if (unavail.length > 0 && !override) {
            if (menuButonMode) {
                enqueueSnackbar("Unavailable LoRAs! Please re-order from viewer", { variant: "warning" })
                return;
            }
            setUnavailLoras(unavail)
            setUnavailLoraWarn(true)
            return;
        }


        const allPrompts = []
        for (let index = 0; index < orderAmount; index++) {
            allPrompts.push(hydratePrompt({
                ...p, ...{
                    cfgScale: settings.globals.cfg ? promptboxPrompt.cfgScale : p.cfgScale,
                    sampler: settings.globals.sampler ? promptboxPrompt.sampler : p.sampler,
                    steps: settings.globals.steps ? promptboxPrompt.steps : p.steps,
                    width: settings.globals.width ? promptboxPrompt.width : p.width,
                    height: settings.globals.height ? promptboxPrompt.height : p.height

                }, orderData: {
                    sample: sample ?? -1,
                    source: source ?? "UNKNOWN",
                    albums: album?.id ? [album?.id] : []
                }
            }, variables, index));
        }

        brewApi.fetch((val) => {
            if (orderAmount !== val?.jobIds.length) {
                enqueueSnackbar(`Only ${val?.jobIds.length} orders placed!`, { variant: 'warning' })
            } else {
                enqueueSnackbar(`${val?.jobIds.length} orders placed!`, { variant: 'success' })
            }

        }, () => {
            enqueueSnackbar("Could not queue images!", { variant: 'error' })
        }, allPrompts)
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
                    <div>Reorder this prompt with the current model</div>
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