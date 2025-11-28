import { useCheckpoints } from "../../hooks/useCheckpoints";
import { CSSProperties } from "react";
import { GeneratedImage } from "../../../model/GeneratedImage";
import { FilterOptions } from "../../../model/FilterOptions";
import ModelCard from "../model/ModelCard";

export default function CheckpointCard(props: {
    checkpointTitle: string
    currentImage?: GeneratedImage
    onClick?: () => void
    tiny?: boolean
    imageStyle?: CSSProperties
    elevation?: number,
    filter?: FilterOptions,
    setFilter?: (val: FilterOptions) => void
}) {

    const { checkpointTitle, onClick, currentImage, tiny, elevation, filter, setFilter, imageStyle } = props;
    const { checkpoints: models, refresh } = useCheckpoints();

    return <ModelCard
        modelId={checkpointTitle}
        currentImage={currentImage}
        onClick={onClick}
        tiny={tiny}
        imageStyle={imageStyle}
        elevation={elevation}
        filter={filter}
        refresh={refresh}
        setFilter={setFilter}
        models={models}
        modelType="Checkpoint"
    />


}