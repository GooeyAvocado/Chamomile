import { useCheckpoints } from "../../hooks/useCheckpoints";
import ModelStrip from "../model/ModelStrip";

export default function CheckpointStrip({ checkpoints: titles, maxLength }: {
    checkpoints: string[]
    maxLength?: number
}) {
    const { checkpoints: models } = useCheckpoints();
    return <ModelStrip models={titles} modelData={models} maxLength={maxLength} />
}