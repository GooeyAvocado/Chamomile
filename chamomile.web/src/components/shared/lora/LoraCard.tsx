import { Card, CardActionArea, Menu, MenuItem, Typography } from "@mui/material";
import { imageUrl } from "../../../api/Images";
import { useLoras } from "../../hooks/useLoras";
import { Lora } from "../../../model/Lora";
import { useState } from "react";
import AreYouSureModal from "../modals/AreYouSureModal";
import useApi from "../../hooks/useApi";
import { updateLora } from "../../../api/Loras";
import { GeneratedImage } from "../../../model/GeneratedImage";
import { useSnackbar } from "notistack";
import ImageModalFromId from "../images/ImageModalFromId";
import ModelTypePill from "../model/ModelType.tsx/ModelTypePill";

export default function LoraCard(props: {
    loraAlias: string
    currentImage?: GeneratedImage
    onClick?: () => void
}) {

    const { loraAlias, onClick, currentImage } = props;
    const { loras, refresh } = useLoras();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [updateAys, setUpdateAys] = useState(false)
    const [imageOpen, setImageOpen] = useState(false)
    
    const updateApi = useApi(updateLora)
    const {enqueueSnackbar} = useSnackbar();

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
            ...lora, bannerImage : currentImage?.id
        } as Lora)
    }

    return <>
        <Card>
            <CardActionArea onClick={onClick ?? openMenu}>
                <div style={{ display: 'flex', padding: "10px", gap: '20px', alignItems: 'center' }}>
                    <img src={lora?.bannerImage ? imageUrl(lora.bannerImage) : '/outline.png'} style={{ width: '64px', height: '64px', objectFit: 'cover', objectPosition: 'center top', borderRadius: '5px', background: '#555' }} />
                    <Typography style={{ fontSize: '1em' }}>
                        <div style={{ flex: '1' }}>
                            <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                                {lora?.type?.length > 0 && <ModelTypePill type={lora?.type}/>}
                                <div style={{display:'flex', gap:'5px', alignItems:'flex-end'}}>
                                    <b>{lora.name}</b>
                                    {!lora?.isAvailable && <div style={{fontSize:'.7em'}}>(Unavailable)</div>}
                                </div>
                            </div>
                            <div style={{ fontSize: '.8em' }}>{lora.alias}</div>
                        </div>
                    </Typography>
                </div>
            </CardActionArea>
        </Card>

        {!onClick && !loraUnavailable() && <>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose}>
                <MenuItem onClick={viewImage} disabled={!lora.bannerImage || lora.bannerImage===currentImage?.id} >View sample image</MenuItem>
                <MenuItem onClick={updateImage} disabled={!currentImage}>Set this as sample image</MenuItem>
            </Menu>
            <AreYouSureModal open={updateAys} setOpen={setUpdateAys} onYes={realUpdateImage} title="Set this image as sample?">
                Are you sure you want to set this image as the sample for this LoRA?
            </AreYouSureModal>
            <ImageModalFromId open={imageOpen} setOpen={setImageOpen} image={lora.bannerImage}/>
        </>}
    </>

}