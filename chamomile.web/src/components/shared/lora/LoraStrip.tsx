import { useLoras } from "../../hooks/useLoras";
import ModelStrip from "../model/ModelStrip";

export default function LoraStrip({ loras: aliases, maxLength }: {
    loras: string[]
    maxLength?: number
}) {
    const { loras } = useLoras();
    return <ModelStrip models={aliases} modelData={loras} maxLength={maxLength} />
}