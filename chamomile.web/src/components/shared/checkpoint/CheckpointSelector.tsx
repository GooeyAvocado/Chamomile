import { useCheckpoints } from "../../hooks/useCheckpoints";
import React from "react";
import { Model } from "../../../model/Model";
import ModelSelector from "../model/ModelSelector";

export default function CheckpointSelector(props: {
    model: string,
    setModel: (val: Model) => void
    style?: React.CSSProperties
    showAll?: boolean
    showAvailability?: boolean
    disabled?: boolean
    loading?: boolean
    error?: boolean
    helperText?: string
}) {

    const { model, setModel, style, showAll, showAvailability, disabled, loading: externalLoading, error } = props;
    const { loading, checkpoints: models, refresh } = useCheckpoints();

    return <ModelSelector
        modelType="Checkpoint"
        onRefresh={refresh}
        loading={loading || externalLoading}
        models={models}
        model={model}
        setModel={setModel}
        showAll={showAll}
        showAvailability={showAvailability}
        helperText={props.helperText}
        disabled={disabled}
        error={error}
        showNone={false}
        style={style}
    />

}