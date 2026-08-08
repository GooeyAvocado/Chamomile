import { Card } from "@mui/material";
import { imageUrl } from "../../../api/Images";
import { useMemo } from "react";

export type ImageStripImage = {
    id?: number,
    tooltip?: string
}

export default function ImageStrip({ images, maxLength, layout, imageSize }: {
    images: (number | ImageStripImage | undefined)[]
    maxLength?: number
    layout?: "HORIZONTAL" | "VERTICAL"
    imageSize?: string
}) {

    const size = imageSize ?? "32px";

    const { displayImages, plus } = useMemo(() => {
        const defined = images.filter((a) => typeof a === "number" || !!a?.id)
            .map(a => typeof a === "number" ? {
                id: a,
                tooltip: undefined
            } : a) as ImageStripImage[];
        const undefinedCount = images.length - defined.length;
        const display = maxLength && defined.length > maxLength ? defined.slice(0, maxLength) : defined;
        const plusCount = (defined.length - display.length) + undefinedCount;

        return { displayImages: display, plus: plusCount };
    }, [images, maxLength]);

    return <div style={{ display: 'flex', gap: "5px", flexDirection: layout === "VERTICAL" ? "column" : undefined }}>
        {displayImages.map(a => <Card key={a.id}>
            <div style={{ width: size, aspectRatio: 1 / 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: "relative" }}>
                <img title={a.tooltip}
                    src={imageUrl(a.id)}
                    style={{
                        width: "100%", height: "100%",
                        objectFit: 'cover', objectPosition: 'center top',
                        position: 'absolute', left: '0', top: '0'
                    }} />

                {/* No idea why we did this */}
                {/* <img
                    src={imageUrl(a)}
                    style={{ width: "50%" }}
                /> */}
            </div>
        </Card>)}
        {plus > 0 && <Card>
            <div style={{ width: size, aspectRatio: 1 / 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: ".8em" }}>
                <div>+{plus}</div>
            </div>
        </Card>}

    </div>

}