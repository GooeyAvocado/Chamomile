import { useMemo } from "react";
import ImageStrip from "../images/ImageStrip";
import { useLoras } from "../../hooks/useLoras";

export default function LoraStrip({ loras: aliases, maxLength }: {
    loras: string[]
    maxLength?: number
}) {

    const { loras } = useLoras();

    const images = useMemo(() =>
        aliases.map(a => loras.find(b => b.alias === a)?.bannerImage)
        , [aliases, loras]);

    return <ImageStrip images={images ?? []} maxLength={maxLength} />

}