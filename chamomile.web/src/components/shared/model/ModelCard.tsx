import { Card, CardActionArea, Divider, IconButton, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
import { Model } from "../../../model/Model";
import { useModels } from "../../hooks/useModels";
import { imageUrl } from "../../../api/Images";
import { CSSProperties, useState } from "react";
import useApi from "../../hooks/useApi";
import { updateModel } from "../../../api/Model";
import { useSnackbar } from "notistack";
import { GeneratedImage } from "../../../model/GeneratedImage";
import AreYouSureModal from "../modals/AreYouSureModal";
import ImageModalFromId from "../images/ImageModalFromId";
import ModelTypePill from "./ModelType/ModelTypePill";
import { MoreVert } from "@mui/icons-material";
import ModelEditorModal from "./ModelEditorModal";

export default function ModelCard(props: {
    modelTitle: string
    currentImage?: GeneratedImage
    onClick?: () => void
    tiny?: boolean
    imageStyle?: CSSProperties
}) {

    const { modelTitle, onClick, currentImage, tiny } = props;
    const { models, refresh } = useModels();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [updateAys, setUpdateAys] = useState(false)
    const [imageOpen, setImageOpen] = useState(false)
    const [editorOpen, setEditorOpen] = useState(false)

    const updateApi = useApi(updateModel)
    const { enqueueSnackbar } = useSnackbar();

    const getModel = () => models?.filter(a => a.title === modelTitle)[0] ?? {
        name: modelTitle,
        description: 'Unknown Model',
        isAvailable: false,
        title: modelTitle,
        bannerImage: undefined
    } as Model

    const modelUnavailable = () => !models?.filter(a => a.title === modelTitle)[0]
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




    const CardImage = (props: { style?: CSSProperties }) => <img src={model?.bannerImage ? imageUrl(model.bannerImage) : '/outline.png'} style={{ width: '32px', height: '32px', objectFit: 'cover', objectPosition: 'center top', borderRadius: '5px', background: '#555', ...props.style }} />
    const CardText = () => <Typography style={{ fontSize: '1em' }}>
        <div style={{ flex: '1', color: model.isAvailable ? "white" : "#777" }}>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                {model?.type?.length > 0 && <ModelTypePill type={model?.type} style={{ flexShrink: "0" }} />}
                <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-end' }}>
                    <b>{model.name}</b>
                </div>
            </div>
            <div style={{ fontSize: ".8em" }}>{`${model.title}${model.isAvailable ? "" : " (Unavailable)"}`}</div>
        </div>
    </Typography>

    const CardContent = (props: { tiny?: boolean, style?: CSSProperties, imageStyle?: CSSProperties }) => <div
        style={{ display: 'flex', padding: "10px", gap: '20px', alignItems: 'center', ...props.style }}>
        <CardImage style={props.imageStyle} />
        {!props.tiny && <CardText />}
    </div>


    return <>
        <Card style={{ display: 'flex', alignItems: 'center', overflowX: 'hidden' }} elevation={3}>
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

        {!modelUnavailable() && <ModelEditorModal open={editorOpen} setOpen={setEditorOpen} onOk={onEditorOk} model={model} />}

        {!onClick && !modelUnavailable() && <>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose}>
                <MenuItem onClick={openEditor} disabled={modelUnavailable()}>Edit Model</MenuItem>
                <Divider />
                <MenuItem onClick={viewImage} disabled={!model.bannerImage || model.bannerImage === currentImage?.id} >View sample image</MenuItem>
                <MenuItem onClick={updateImage} disabled={!currentImage}>Set this as sample image</MenuItem>
            </Menu>
            <AreYouSureModal open={updateAys} setOpen={setUpdateAys} onYes={realUpdateImage} title="Set this image as sample?">
                Are you sure you want to set this image as the sample for this model?
            </AreYouSureModal>
            <ImageModalFromId open={imageOpen} setOpen={setImageOpen} image={model.bannerImage} />
        </>}
    </>

}