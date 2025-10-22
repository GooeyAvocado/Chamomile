import { IconButton, Tooltip } from "@mui/material"
import { useMemo, useState } from "react"
import { Close, ReceiptLong } from "@mui/icons-material"
import { Prompt } from "../../../model/Prompt"
import { useSettings } from "../../hooks/useSettings"

export default function PromptBuilderClearButton({ prompt, setPrompt }: {
    prompt?: Prompt
    setPrompt: (prompt: Prompt) => void
}) {

    const [hovered, setHovered] = useState(false)
    const { settings } = useSettings();

    const defaultPrompt = useMemo(() => {
        return {
            id: undefined,
            name: "",
            sampleImage: undefined,
            positivePrompt: "",
            negativePrompt: settings?.defaults?.negativePrompt ?? "",
            width: settings?.defaults?.width ?? 1024,
            height: settings?.defaults?.height ?? 1024,
            sampler: settings?.defaults?.sampler ?? "DPM++ 2M",
            steps: settings?.defaults?.steps ?? 30,
            cfgScale: settings?.defaults?.cfg ?? 4.0,
            seed: -1,
            variables: {},
            orderData: {},
            scheduleType: settings?.defaults?.scheduler ?? "Automatic",
        } as Prompt
    }, [settings])


    const onClear = () => {
        setPrompt(defaultPrompt)
    }

    return <Tooltip title="Clear Prompt">
        <IconButton
            size="small"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onClear}
        >
            {hovered ? <Close /> : <ReceiptLong />}
        </IconButton>
    </Tooltip>

}