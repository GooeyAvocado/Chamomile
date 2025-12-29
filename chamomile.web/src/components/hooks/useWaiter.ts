import { useSnackbar } from "notistack";
import useApi from "./useApi";
import { usePrompt } from "./usePrompt";
import { useSettings } from "./useSettings";
import { usePingPong } from "./usePingPong";
import { useLoras } from "./useLoras";
import { Prompt } from "../../model/Prompt";
import { enqueuePrompts } from "../../api/Images";
import { hydratePrompt } from "../shared/Utils";
import { useState } from "react";
import { Model } from "../../model/Model";

/**
 * This is a quick hook that handles asking Chamomile to brew an image.
 * Technically this is mostly used in the brewButton but I want this functionality elsewhere so waos
 */
export default function useWaiter(suppressWarning?: boolean) {

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
        lora?: Model
    }[]>([])

    const onBrew = (p: Prompt, sample?: number, source?: "IMAGE_BASE" | "IMAGE" | "SAVED_PROMPT", forcePrompt?: boolean) => {

        if (!pong) return;


        //CHECK are there any unknown or unavailable LoRAs
        //First get a list of all LoRAs on this prompt (re-do the regex in case there's LoRAs that are unknown)
        const loraRegex = /<lora:[^>]+>/g;
        const loraMatches = p.positivePrompt.match(loraRegex) || [];

        const unavail = loraMatches.map(a => {
            const loraAlias = a.match(/<lora:([^>]+):[^>]+>/)?.[1]
            return {
                text: a,
                lora: loras?.find(a => a.id === loraAlias)
            }
        }).filter(a => !a.lora || !a.lora.isAvailable)

        if (unavail.length > 0 && !forcePrompt) {
            if (!suppressWarning) {
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
                    height: settings.globals.height ? promptboxPrompt.height : p.height,
                    negativePrompt: settings.globals.negativePrompt ? promptboxPrompt.negativePrompt : p.negativePrompt

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

    return {
        onBrew,
        unavailLoraWarn, setUnavailLoraWarn,
        unavailLoras
    }

}