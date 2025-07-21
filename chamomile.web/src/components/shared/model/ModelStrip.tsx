import { useMemo } from "react";
import ImageStrip from "../images/ImageStrip";
import { useModels } from "../../hooks/useModels";

export default function ModelStrip({ models: titles, maxLength }: {
    models: string[]
    maxLength?: number
}) {

    const { models } = useModels();

    const images = useMemo(() =>
        titles.map(a => models.find(b => b.title === a)?.bannerImage)
        , [titles, models]);

    return <ImageStrip images={images ?? []} maxLength={maxLength} />

}