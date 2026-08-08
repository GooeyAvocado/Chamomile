import { useMemo } from "react";
import ImageStrip, { ImageStripImage } from "../images/ImageStrip";
import { Model } from "../../../model/Model";

export default function ModelStrip({ models: ids, maxLength, modelData }: {
    models: string[]
    modelData?: Model[]
    maxLength?: number
}) {

    const images = useMemo(() => ids.map(a => {

        const model = modelData?.find(b => b.id === a)
        return model ? {
            id: model.bannerImage,
            tooltip: model.name
        } as ImageStripImage : undefined
    })
        , [ids, modelData]);

    return <ImageStrip images={images ?? []} maxLength={maxLength} />

}