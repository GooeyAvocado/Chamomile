import { useSnackbar } from "notistack";
import useApi from "./useApi";
import { usePrompt } from "./usePrompt";
import { useSettings } from "./useSettings";
import { usePingPong } from "./usePingPong";
import { useLoras } from "./useLoras";
import { Prompt } from "../../model/Prompt";
import { enqueueHighPriorityPrompts, enqueuePrompts } from "../../api/Images";
import { hydratePrompt } from "../shared/Utils";
import { useState } from "react";
import { Model } from "../../model/Model";
import { PromptSource } from "../../model/PromptOrderData";

export interface WaiterOrder {
    prompt: Prompt | Prompt[]
    rush?: boolean
    source?: PromptSource

    forcePrompt?: boolean
    amountOverride?: number
}

/**
 * The waiter takes orders to the kitchen. As in, this is the only
 * thing that should be enqueueing prompts. 
 * 
 * In retrospect, we should've probably called this something like
 * useBarista, but it's too late now. oops.
 * 
 * Waos, we got this to be used anywhere we need to brew
 */
export default function useWaiter(showWarning?: boolean) {

    const { settings } = useSettings();

    const { prompt: promptboxPrompt, orderAmount: promptOrderAmount, variables } = usePrompt()
    const brewApi = useApi(enqueuePrompts)
    const rushBrewApi = useApi(enqueueHighPriorityPrompts)
    const { enqueueSnackbar } = useSnackbar();
    const { album } = usePrompt();
    const { pong } = usePingPong()
    const { loras } = useLoras();

    const [unavailLoraWarn, setUnavailLoraWarn] = useState(false)
    const [unavailLoras, setUnavailLoras] = useState<{
        text: string,
        lora?: Model
    }[]>([])

    const onBrew = (order: WaiterOrder) => {

        const { prompt, forcePrompt, rush, source, amountOverride } = order

        const orderAmount = amountOverride ?? promptOrderAmount

        if (!pong) return;


        //CHECK are there any unknown or unavailable LoRAs
        //First get a list of all LoRAs on this prompt (re-do the regex in case there's LoRAs that are unknown)

        //This check is skipped if we're provided a list, or if we're going to force the prompt anyways
        if (!Array.isArray(prompt) && !forcePrompt) {
            const loraRegex = /<lora:[^>]+>/g;
            const loraMatches = prompt.positivePrompt.match(loraRegex) || [];

            const unavail = loraMatches.map(a => {
                const loraAlias = a.match(/<lora:([^>]+):[^>]+>/)?.[1]
                return {
                    text: a,
                    lora: loras?.find(a => a.id === loraAlias)
                }
            }).filter(a => !a.lora || !a.lora.isAvailable)

            if (unavail.length > 0) {
                if (showWarning) {
                    enqueueSnackbar("Unavailable LoRAs! Please re-order from viewer", { variant: "warning" })
                }
                setUnavailLoras(unavail)
                setUnavailLoraWarn(true)
                return;
            }
        }

        const orderPrompts = Array.isArray(prompt) ? prompt : [prompt]
        const allPrompts: Prompt[] = []

        orderPrompts.forEach(p => {
            for (let index = 0; index < orderAmount; index++) {
                allPrompts.push(hydratePrompt({
                    ...p, ...{
                        cfgScale: settings.globals.cfg ? promptboxPrompt.cfgScale : p.cfgScale,
                        sampler: settings.globals.sampler ? promptboxPrompt.sampler : p.sampler,
                        steps: settings.globals.steps ? promptboxPrompt.steps : p.steps,
                        width: settings.globals.width ? promptboxPrompt.width : p.width,
                        height: settings.globals.height ? promptboxPrompt.height : p.height,
                        negativePrompt: settings.globals.negativePrompt ? promptboxPrompt.negativePrompt : p.negativePrompt

                    }, orderData: {
                        sample: p.sampleImage ?? -1,
                        source: source ?? "UNKNOWN",
                        albums: album?.id ? [album?.id] : []
                    }
                }, variables, index));
            }
        });

        (rush ? rushBrewApi : brewApi).fetch((val) => {
            if ((orderAmount * orderPrompts.length) !== val?.jobIds.length) {
                enqueueSnackbar(`Only ${val?.jobIds.length}${rush ? " rush" : ""} orders placed!`, { variant: 'warning' })
            } else {
                if (orderAmount === 1) {
                    enqueueSnackbar(`Single${rush ? " rush" : ""} order placed!`, { variant: 'success' })
                } else {
                    enqueueSnackbar(`${val?.jobIds.length}${rush ? " rush" : ""} orders placed!`, { variant: 'success' })
                }
            }

        }, () => {
            enqueueSnackbar("Could not queue images!", { variant: 'error' })
        }, allPrompts)
    }

    return {
        onBrew, busy: brewApi.loading || rushBrewApi.loading,
        unavailLoraWarn, setUnavailLoraWarn,
        unavailLoras
    }

}