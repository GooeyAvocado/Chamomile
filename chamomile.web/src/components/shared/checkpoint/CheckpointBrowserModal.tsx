import { Model } from "../../../model/Model";
import ModelBrowserModal from "../model/ModelBrowserModal";
import { useCheckpoints } from "../../hooks/useCheckpoints";

export default function CheckpointBrowserModal(props: {
    showAny?: boolean
    showNone?: boolean
    showAvailability?: boolean
    onOk: (val: Model[]) => void
    open: boolean
    setOpen: (val: boolean) => void
    initialSelected?: string[]
    multiSelect?: boolean
}) {

    const { loading, checkpoints, refresh } = useCheckpoints();

    return <ModelBrowserModal
        modelType="Checkpoint"
        onRefresh={refresh}
        loading={loading}
        models={checkpoints}
        showNone={props.showNone}
        showAvailability={props.showAvailability}
        onOk={props.onOk}
        showAny={props.showAny}
        open={props.open}
        setOpen={props.setOpen}
        initialSelected={props.initialSelected}
        multiSelect={props.multiSelect}
    />
}