import React from "react";
import { useLoras } from "../../hooks/useLoras";
import { Model } from "../../../model/Model";
import ModelSelector from "../model/ModelSelector";

export default function LoraSelector(props: {
    lora: string,
    setLora: (val: Model) => void
    style?: React.CSSProperties

    showAll?: boolean
    showNone?: boolean
    showAvailability?: boolean
    disabled?: boolean
    error?: boolean
    helperText?: string
}) {

    const { loading, loras, refresh } = useLoras();

    return <ModelSelector
        modelType="LoRA"
        onRefresh={refresh}
        loading={loading}
        models={loras}
        showAll={props.showAll}
        showNone={props.showNone}
        showAvailability={props.showAvailability}
        helperText={props.helperText}
        disabled={props.disabled}
        error={props.error}
        model={props.lora}
        setModel={props.setLora}
        style={props.style}
    />
}