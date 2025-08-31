import { useMemo } from "react";
import { GeneratedImage } from "../../../model/GeneratedImage";
import { useLoras } from "../../hooks/useLoras";
import { useModels } from "../../hooks/useModels";
import { MenuItemWithSubMenu } from "../mui/MenuItemWithSubmenu";
import { TravelExplore, Wallpaper } from "@mui/icons-material";
import { Card, Divider, ListItemIcon, MenuItem } from "@mui/material";
import { FilterOptions } from "../../../model/FilterOptions";
import { imageUrl } from "../../../api/Images";

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
        icon={<TravelExplore />}
    >
        <MenuItem
            onClick={() => { setFilter({ ...filter, model: image.model }) }}
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
            {imageModel?.name}
        </MenuItem>
        {imageLoras?.length > 0 && <Divider />}
        {imageLoras?.map(l => <MenuItem key={image.id + "-showMore-" + l.alias}
            onClick={() => { setFilter({ ...filter, lora: l.alias }) }}
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
            {l.name}
        </MenuItem>)}
        <Divider />
        <MenuItem
            onClick={() => { setFilter({ ...filter, sample: image.additionalInfo?.sample }) }}
            disabled={(image.additionalInfo?.sample ?? -1) <= 0}
        >
            <ListItemIcon>{
                (image.additionalInfo?.sample ?? -1) > 0
                    ? <Card style={{ width: "24px", aspectRatio: "1/1" }}>
                        <img src={imageUrl(image.additionalInfo?.sample)}
                            style={{
                                width: "100%", height: "100%",
                                objectFit: 'cover', objectPosition: 'center top'
                            }}
                        />
                    </Card>
                    : <Wallpaper />
            }</ListItemIcon>
            Source
        </MenuItem>
    </MenuItemWithSubMenu>

}