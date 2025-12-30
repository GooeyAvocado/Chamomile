import { useLoras } from "../../hooks/useLoras";
import { Model } from "../../../model/Model";
import ModelBrowserModal from "../model/ModelBrowserModal";

export default function LoraBrowserModal(props: {
    showAny?: boolean
    showNone?: boolean
    showAvailability?: boolean
    onOk: (val: Model[]) => void
    open: boolean
    setOpen: (val: boolean) => void
    initialSelected?: string[]
    multiSelect?: boolean
}) {

    const { loading, loras, refresh } = useLoras();

    return <ModelBrowserModal
        modelType="LoRA"
        onRefresh={refresh}
        loading={loading}
        models={loras}
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