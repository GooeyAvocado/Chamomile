import { useMemo } from "react";
import { GeneratedImage } from "../../../model/GeneratedImage";
import { useLoras } from "../../hooks/useLoras";
import { useModels } from "../../hooks/useModels";
import { MenuItemWithSubMenu } from "../mui/MenuItemWithSubmenu";
import { ImageSearch, ReceiptLong, ReceiptLongTwoTone } from "@mui/icons-material";
import { Card, Divider, ListItemIcon, MenuItem } from "@mui/material";
import { FilterOptions } from "../../../model/FilterOptions";
import { imageUrl } from "../../../api/Images";
import { clearFilter } from "../Utils";

export const SOURCE_FRIENDLY_NAMES = {
    "GRID": "Grid",
    "SAVED_PROMPT": "Recipe",
    "IMAGE_BASE": "Existing image",
    "IMAGE": "Existing image",
    "PROMPTBOX": "Prompt",
    "UPLOAD": "Upload"
} as Record<string, string>

export default function ImageMoreFromMenu({
    image, filter, setFilter
}: {
    image: GeneratedImage,
    filter: FilterOptions
    setFilter: (val: FilterOptions) => void
}) {

    const { models } = useModels();
    const { loras } = useLoras();

    const imageModel = useMemo(() =>
        models?.find(a => a.title === image.model)
        , [image.model])

    const imageLoras = useMemo(() =>
        loras?.filter(a => image.loras.includes(a.alias))
        , [image.loras])

    return <MenuItemWithSubMenu
        label="More like this by..."
        icon={<ImageSearch />}
    >
        <MenuItem
            onClick={() => { setFilter({ ...clearFilter(filter), model: image.model }) }}
        >
            <ListItemIcon >{
                <Card style={{ width: "24px", aspectRatio: "1/1" }}>
                    <img src={imageUrl(imageModel?.bannerImage)}
                        style={{
                            width: "100%", height: "100%",
                            objectFit: 'cover', objectPosition: 'center top'
                        }}
                    />
                </Card>
            }</ListItemIcon>
            <div>
                <div style={{ fontSize: '.8em' }}>Checkpoint</div>
                <div style={{ fontSize: ".7em", opacity: ".7" }}>{imageModel?.name}</div>
            </div>
        </MenuItem>
        {imageLoras?.length > 0 && <Divider />}
        {imageLoras?.map(l => <MenuItem key={image.id + "-showMore-" + l.alias}
            onClick={() => { setFilter({ ...clearFilter(filter), lora: l.alias }) }}
        >
            <ListItemIcon >{
                <Card style={{ width: "24px", aspectRatio: "1/1" }}>
                    <img src={imageUrl(l?.bannerImage)}
                        style={{
                            width: "100%", height: "100%",
                            objectFit: 'cover', objectPosition: 'center top'
                        }}
                    />
                </Card>
            }</ListItemIcon>
            <div>
                <div style={{ fontSize: '.8em' }}>LoRA</div>
                <div style={{ fontSize: ".7em", opacity: ".7" }}>{l.name}</div>
            </div>
        </MenuItem>)}
        <Divider />
        <MenuItem onClick={() => { setFilter({ ...clearFilter(filter), sampleMode: "HASH", sample: image.id }) }}>
            <ListItemIcon>
                <ReceiptLong />
            </ListItemIcon>
            <div>
                <div style={{ fontSize: '.8em' }}>Prompt (+/-)</div>
            </div>
        </MenuItem>
        {image.basePrompt && image.basePrompt.trim().length > 0 && image.prompt !== image.basePrompt && <MenuItem onClick={() => { setFilter({ ...clearFilter(filter), sampleMode: "BASE_HASH", sample: image.id }) }}>
            <ListItemIcon>
                <ReceiptLongTwoTone />
            </ListItemIcon>
            <div>
                <div style={{ fontSize: '.8em' }}>Base prompt</div>
            </div>
        </MenuItem>}
        <Divider />
        <MenuItem
            onClick={() => {
                setFilter({
                    ...clearFilter(filter), sampleMode: "SAMPLE", sample:
                        (image.additionalInfo?.sample ?? -1) > 0
                            ? image.additionalInfo?.sample
                            : image.id
                })
            }}
        >
            <ListItemIcon>

                {(image.additionalInfo?.sample ?? -1) > 0 ?
                    <Card style={{ width: "24px", aspectRatio: "1/1" }}>
                        <img src={imageUrl(image.additionalInfo?.sample)}
                            style={{
                                width: "100%", height: "100%",
                                objectFit: 'cover', objectPosition: 'center top'
                            }}
                        />
                    </Card>
                    : <ImageSearch />
                }
            </ListItemIcon>
            <div>
                <div style={{ fontSize: '.8em' }}>{(image.additionalInfo?.sample ?? -1) > 0 ? "Source" : "Derivations"}</div>
                <div style={{ fontSize: ".7em", opacity: ".7" }}>{SOURCE_FRIENDLY_NAMES[image.additionalInfo?.source ?? ""] ?? "Unknown"}</div>
            </div>
        </MenuItem>
    </MenuItemWithSubMenu>

}