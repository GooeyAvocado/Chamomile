import { Card, CardActionArea, Divider, IconButton, ListItemIcon, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
import { imageUrl } from "../../../api/Images";
import { CSSProperties, useState } from "react";
import useApi from "../../hooks/useApi";
import { updateCheckpoint } from "../../../api/Checkpoint";
import { useSnackbar } from "notistack";
import { GeneratedImage } from "../../../model/GeneratedImage";
import AreYouSureModal from "../modals/AreYouSureModal";
import ImageModalFromId from "../images/ImageModalFromId";
import ModelTypePill from "./ModelType/ModelTypePill";
import { AddPhotoAlternate, Edit, Image, ImageSearch, MoreVert } from "@mui/icons-material";
import ModelEditorModal from "./ModelEditorModal";
import { FilterOptions } from "../../../model/FilterOptions";
import { clearFilter } from "../Utils";
import { Model, ModelType } from "../../../model/Model";
import { updateLora } from "../../../api/Loras";

export default function ModelCard(props: {
    modelId: string
    currentImage?: GeneratedImage
    onClick?: () => void
    tiny?: boolean
    imageStyle?: CSSProperties
    elevation?: number,
    filter?: FilterOptions,
    setFilter?: (val: FilterOptions) => void
    models?: Model[]
    modelType?: ModelType
    refresh: () => void
}) {

    const { modelId, onClick, currentImage, tiny, elevation, filter, setFilter, modelType, models, refresh } = props;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [updateAys, setUpdateAys] = useState(false)
    const [imageOpen, setImageOpen] = useState(false)
    const [editorOpen, setEditorOpen] = useState(false)

    const updateApi = useApi(modelType === "Checkpoint" ? updateCheckpoint : updateLora)
    const { enqueueSnackbar } = useSnackbar();

    const getModel = () => models?.filter(a => a.id === modelId)[0] ?? {
        name: modelId,
        description: 'Unknown Model',
        isAvailable: false,
        id: modelId,
        bannerImage: undefined
    } as Model

    const modelUnavailable = () => !models?.filter(a => a.id === modelId)[0]
    const model = getModel();

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
            ...model, bannerImage: currentImage?.id
        } as Model)
    }

    const onEditorOk = (val: Model) => {
        setEditorOpen(false)
        updateApi.fetch(() => {
            refresh()
            enqueueSnackbar("Model updated!", { variant: 'success' })
        }, () => {
            enqueueSnackbar("Error while updating model", { variant: 'error' })
        }, val)
    }

    const openEditor = () => {
        handleClose()
        setEditorOpen(true)
    }




    const CardImage = (props: { style?: CSSProperties }) => <img loading="lazy" src={model?.bannerImage ? imageUrl(model.bannerImage) : '/outline.png'} style={{ width: '32px', height: '32px', objectFit: 'cover', objectPosition: 'center top', borderRadius: '5px', background: '#555', ...props.style }} />

    const CardText = () => <Typography style={{ fontSize: '1em' }}>
        <div style={{ flex: '1', color: model.isAvailable ? "white" : "#777" }}>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                {model?.type?.length > 0 && <ModelTypePill type={model?.type} style={{ flexShrink: "0" }} />}
                {(model?.tags?.[0]?.length ?? 0) > 0 && <ModelTypePill type={model?.tags?.[0] ?? ""} style={{ flexShrink: "0" }} bgColor={`rgba(255,255,255,0.1)`} />}
                <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-end' }}>
                    <b>{model.name}</b>
                </div>
            </div>
            <div style={{ fontSize: ".8em" }}>{`${model.id}${model.isAvailable ? "" : " (Unavailable)"}`}</div>
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
                    onClick={onClick ?? (tiny || modelUnavailable() ? openMenu : openEditor)}
                    style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}
                >
                    <CardContent tiny={tiny}
                        imageStyle={props.imageStyle}
                    />
                </CardActionArea>
            </Tooltip>
            {!tiny && !modelUnavailable() && <div style={{ flexShrink: '0' }}><IconButton onClick={openMenu}><MoreVert /></IconButton></div>}
        </Card>

        {!modelUnavailable() && <ModelEditorModal open={editorOpen} setOpen={setEditorOpen} onOk={onEditorOk} model={model} modelType={modelType} currentImage={currentImage} />}

        {!onClick && !modelUnavailable() && <>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose}>
                <MenuItem onClick={openEditor} disabled={modelUnavailable()}>
                    <ListItemIcon><Edit /></ListItemIcon>
                    Edit checkpoint
                </MenuItem>
                <Divider />
                <MenuItem onClick={viewImage} disabled={!model.bannerImage || model.bannerImage === currentImage?.id} >
                    <ListItemIcon><Image /></ListItemIcon>
                    View sample image
                </MenuItem>
                {currentImage && <MenuItem onClick={updateImage}>
                    <ListItemIcon><AddPhotoAlternate /></ListItemIcon>
                    Set this as sample image
                </MenuItem>}
                {filter && setFilter && [
                    <Divider />,
                    <MenuItem onClick={() => {
                        setFilter(modelType === "LoRA" ? { ...clearFilter(filter), lora: model.id } : { ...clearFilter(filter), model: model.id })
                    }}>
                        <ListItemIcon><ImageSearch /></ListItemIcon>
                        View images with this model
                    </MenuItem>
                ]}
            </Menu>
            <AreYouSureModal open={updateAys} setOpen={setUpdateAys} onYes={realUpdateImage} title="Set this image as sample?">
                Are you sure you want to set this image as the sample for this {modelType?.toLowerCase()}?
            </AreYouSureModal>
            <ImageModalFromId open={imageOpen} setOpen={setImageOpen} image={model.bannerImage} />
        </>}
    </>

}