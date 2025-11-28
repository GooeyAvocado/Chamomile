import { useMemo } from "react";
import ImageStrip from "../images/ImageStrip";
import { Model } from "../../../model/Model";

export default function ModelStrip({ models: ids, maxLength, modelData }: {
    models: string[]
    modelData?: Model[]
    maxLength?: number
}) {

    const images = useMemo(() =>
        ids.map(a => modelData?.find(b => b.id === a)?.bannerImage)
        , [ids, modelData]);

    return <ImageStrip images={images ?? []} maxLength={maxLength} />

}