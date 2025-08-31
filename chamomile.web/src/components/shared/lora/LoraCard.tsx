import { Card, CardActionArea, Divider, IconButton, ListItemIcon, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
import { imageUrl } from "../../../api/Images";
import { useLoras } from "../../hooks/useLoras";
import { Lora } from "../../../model/Lora";
import { CSSProperties, useState } from "react";
import AreYouSureModal from "../modals/AreYouSureModal";
import useApi from "../../hooks/useApi";
import { updateLora } from "../../../api/Loras";
import { GeneratedImage } from "../../../model/GeneratedImage";
import { useSnackbar } from "notistack";
import ImageModalFromId from "../images/ImageModalFromId";
import ModelTypePill from "../model/ModelType/ModelTypePill";
import { AddPhotoAlternate, Edit, Image, ImageSearch, MoreVert } from "@mui/icons-material";
import LoraEditorModal from "./LoraEditorModal";
import { FilterOptions } from "../../../model/FilterOptions";

export default function LoraCard(props: {
    loraAlias: string
    currentImage?: GeneratedImage
    onClick?: () => void
    tiny?: boolean
    imageStyle?: CSSProperties
    elevation?: number
    filter?: FilterOptions,
    setFilter?: (val: FilterOptions) => void
}) {

    const { loraAlias, onClick, currentImage, tiny, elevation, filter, setFilter } = props;
    const { loras, refresh } = useLoras();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [editorOpen, setEditorOpen] = useState(false)
    const [updateAys, setUpdateAys] = useState(false)
    const [imageOpen, setImageOpen] = useState(false)

    const updateApi = useApi(updateLora)
    const { enqueueSnackbar } = useSnackbar();

    const getLora = () => loras?.filter(a => a.alias === loraAlias)[0] ?? {
        alias: loraAlias,
        description: 'Unknown LoRA',
        isAvailable: false,
        name: loraAlias,
        samplePrompt: '',
        bannerImage: undefined
    } as Lora

    const loraUnavailable = () => !loras?.filter(a => a.alias === loraAlias)[0]
    const lora = getLora();

    const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        handleClose();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const viewImage = () => {
        handleClose();
        setImageOpen(true);
    }

    const updateImage = () => {
        handleClose();
        setUpdateAys(true)
    }

    const realUpdateImage = () => {
        setUpdateAys(false)
        updateApi.fetch(() => {
            refresh()
            enqueueSnackbar("Image set!", { variant: 'success' })
        }, () => {
            enqueueSnackbar("Error while updating image", { variant: 'error' })
        }, {
            ...lora, bannerImage: currentImage?.id
        } as Lora)
    }

    const onEditorOk = (val: Lora) => {
        setEditorOpen(false)
        updateApi.fetch(() => {
            refresh()
            enqueueSnackbar("Lora updated!", { variant: 'success' })
        }, () => {
            enqueueSnackbar("Error while updating Lora", { variant: 'error' })
        }, val)
    }

    const openEditor = () => {
        handleClose()
        setEditorOpen(true)
    }

    const CardImage = (props: { style?: CSSProperties }) => <img loading="lazy" src={lora?.bannerImage ? imageUrl(lora.bannerImage) : '/outline.png'} style={{ width: '32px', height: '32px', objectFit: 'cover', objectPosition: 'center top', borderRadius: '5px', background: '#555', ...props.style }} />
    const CardText = () => <Typography style={{ fontSize: '1em' }}>
        <div style={{ flex: '1', color: lora.isAvailable ? "white" : "#777" }}>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                {lora?.type?.length > 0 && <ModelTypePill type={lora?.type} style={{ flexShrink: "0" }} />}
                <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-end' }}>
                    <b>{lora.name}</b>
                </div>
            </div>
            <div style={{ fontSize: '.8em' }}>{`${lora.alias}${lora.isAvailable ? "" : " (Unavailable)"}`}</div>
        </div>
    </Typography>

    const CardContent = (props: { tiny?: boolean, style?: CSSProperties, imageStyle?: CSSProperties }) => <div
        style={{ display: 'flex', padding: "10px", gap: '20px', alignItems: 'center', ...props.style }}>
        <CardImage style={props.imageStyle} />
        {!props.tiny && <CardText />}
    </div>


    return <>
        <Card style={{ display: 'flex', alignItems: 'center', overflowX: 'hidden' }} elevation={elevation ?? 3}>
            <Tooltip title={tiny ?
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <CardContent style={{ padding: '0px', gap: "10px" }} imageStyle={{ width: "64px", height: '64px' }} />
                </div> : ""}>
                <CardActionArea
                    onClick={onClick ?? (tiny || loraUnavailable() ? openMenu : openEditor)}
                    style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}
                >
                    <CardContent tiny={tiny}
                        imageStyle={props.imageStyle}
                    />
                </CardActionArea>
            </Tooltip>
            {!tiny && !loraUnavailable() && <div style={{ flexShrink: '0' }}><IconButton onClick={openMenu}><MoreVert /></IconButton></div>}
        </Card>

        {!loraUnavailable() && <LoraEditorModal open={editorOpen} setOpen={setEditorOpen} onOk={onEditorOk} lora={lora} />}

        {!onClick && !loraUnavailable() && <>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose}>
                <MenuItem onClick={openEditor} disabled={loraUnavailable()}>
                    <ListItemIcon><Edit /></ListItemIcon>
                    Edit LoRA
                </MenuItem>
                <Divider />
                <MenuItem onClick={viewImage} disabled={!lora.bannerImage || lora.bannerImage === currentImage?.id} >
                    <ListItemIcon><Image /></ListItemIcon>
                    View sample image
                </MenuItem>
                <MenuItem onClick={updateImage} disabled={!currentImage}>
                    <ListItemIcon><AddPhotoAlternate /></ListItemIcon>
                    Set this as sample image
                </MenuItem>
                {filter && setFilter && <>
                    <Divider />
                    <MenuItem onClick={() => {
                        setFilter({ ...filter, lora: lora.alias })
                    }}>
                        <ListItemIcon><ImageSearch /></ListItemIcon>
                        View images with this LoRA
                    </MenuItem>
                </>}
            </Menu>
            <AreYouSureModal open={updateAys} setOpen={setUpdateAys} onYes={realUpdateImage} title="Set this image as sample?">
                Are you sure you want to set this image as the sample for this LoRA?
            </AreYouSureModal>
            <ImageModalFromId open={imageOpen} setOpen={setImageOpen} image={lora.bannerImage} />
        </>}
    </>


}