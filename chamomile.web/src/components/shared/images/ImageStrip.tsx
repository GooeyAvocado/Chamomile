import { Card } from "@mui/material";
import { imageUrl } from "../../../api/Images";

export default function ImageStrip({ images, maxLength }: {
    images: (number | undefined)[]
    maxLength?: number
}) {

    //get the images that are not undefined
    const definedImages = images.filter(a => !!a) as number[];
    const undefinedImageCount = images.length - definedImages.length

    const displayImages = maxLength && definedImages.length > maxLength
        ? definedImages.slice(0, maxLength)
        : definedImages;

    const plus = (definedImages.length - displayImages.length) + undefinedImageCount;

    return <div style={{ display: 'flex', gap: "5px" }}>
        {displayImages.map(a => <Card>
            <div style={{ maxWidth: "32px", aspectRatio: 1 / 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: "relative" }}>
                <img loading="lazy" src={imageUrl(a)} style={{ width: "100%", height: "100%", objectFit: 'cover', objectPosition: 'center top', position: 'absolute', left: '0', top: '0' }} />
                <img
                    src={imageUrl(a)}
                    style={{ width: "50%" }}
                />
            </div>
        </Card>)}
        {plus > 0 && <Card>
            <div style={{ width: "32px", aspectRatio: 1 / 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: ".8em" }}>
                <div>+{plus}</div>
            </div>
        </Card>}

    </div>

}