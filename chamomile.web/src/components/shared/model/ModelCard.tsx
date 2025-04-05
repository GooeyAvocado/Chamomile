import { Card, CardActionArea, Menu, MenuItem, Typography } from "@mui/material";
import { Model } from "../../../model/Model";
import { useModels } from "../../hooks/useModels";
import { imageUrl } from "../../../api/Images";
import { useState } from "react";
import useApi from "../../hooks/useApi";
import { updateModel } from "../../../api/Model";
import { useSnackbar } from "notistack";
import { GeneratedImage } from "../../../model/GeneratedImage";
import AreYouSureModal from "../modals/AreYouSureModal";
import ImageModalFromId from "../images/ImageModalFromId";
import ModelTypePill from "./ModelType.tsx/ModelTypePill";

export default function ModelCard(props: {
    modelTitle: string
    currentImage?: GeneratedImage
    onClick?: () => void
}) {

    const { modelTitle, onClick, currentImage } = props;
    const { models, refresh } = useModels();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [updateAys, setUpdateAys] = useState(false)
    const [imageOpen, setImageOpen] = useState(false)
    
    const updateApi = useApi(updateModel)
    const {enqueueSnackbar} = useSnackbar();
    
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
        updateApi.fetch(()=>{
            refresh()
            enqueueSnackbar("Image set!", {variant:'success'})
        },()=>{
            enqueueSnackbar("Error while updating image", {variant:'error'})
        },{
            ...model, bannerImage : currentImage?.id
        } as Model)
    }

    return <>
        <Card>
            <CardActionArea onClick={onClick ?? openMenu}>
                <div style={{ display: 'flex', padding: "10px", gap: '20px', alignItems: 'center' }}>
                    <img src={model?.bannerImage ? imageUrl(model.bannerImage) : '/outline.png'} style={{ width: '64px', height: '64px', objectFit: 'cover', objectPosition: 'center top', borderRadius: '5px', background: '#555' }} />
                    <Typography style={{ fontSize: '1em' }}>
                        <div style={{ flex: '1' }}>
                            <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                                {model?.type?.length > 0 && <ModelTypePill type={model?.type}/>}
                                <div style={{display:'flex', gap:'5px', alignItems:'flex-end'}}>
                                    <b>{model.name}</b>
                                    {!model?.isAvailable && <div style={{fontSize:'.7em'}}>(Unavailable)</div>}
                                </div>
                            </div>
                            <div style={{ fontSize: '.8em' }}>{model.title}</div>
                        </div>
                    </Typography>
                </div>
            </CardActionArea>
        </Card>

        {!onClick && !modelUnavailable() && <>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose}>
                <MenuItem onClick={viewImage} disabled={!model.bannerImage || model.bannerImage===currentImage?.id} >View sample image</MenuItem>
                <MenuItem onClick={updateImage} disabled={!currentImage}>Set this as sample image</MenuItem>
            </Menu>
            <AreYouSureModal open={updateAys} setOpen={setUpdateAys} onYes={realUpdateImage} title="Set this image as sample?">
                Are you sure you want to set this image as the sample for this model?
            </AreYouSureModal>
            <ImageModalFromId open={imageOpen} setOpen={setImageOpen} image={model.bannerImage}/>
        </>}
    </>

}