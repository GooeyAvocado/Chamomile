import { Button, Card, CircularProgress, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { GeneratedImage } from "../../../model/GeneratedImage";
import { useUpscalers } from "../../hooks/useUpscalers";
import useApi from "../../hooks/useApi";
import { hiResImage } from "../../../api/Images";
import { useSnackbar } from "notistack";
import { HiResRequest } from "../../../model/HiResRequest";
import { usePingPong } from "../../hooks/usePingPong";

export default function HiResPanel(props: {
    image?: GeneratedImage
    updateImage?: (val: GeneratedImage) => void
}) {

    const { pong } = usePingPong();

    const { image, updateImage } = props
    const { selectedUpscaler, setSelectedUpscaler, setUpscaleScale, upscaleScale, upscalers } = useUpscalers()
    const upscaleApi = useApi(hiResImage)
    const { enqueueSnackbar } = useSnackbar();

    const onUpscale = () => {

        if (selectedUpscaler.length === 0) return;

        upscaleApi.fetch(val => {
            enqueueSnackbar("Image upscaled!", { variant: 'success' })
            if (val) updateImage?.(val);
        }, () => {
            enqueueSnackbar("Image failed to be upscaled", { variant: 'error' })
        }, {
            imageID: image?.id,
            resizeFactor: upscaleScale,
            upscaler: selectedUpscaler
        } as HiResRequest);
    }


    return <Card elevation={7}>
        <div style={{ padding: '10px', height: "100px", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: upscaleApi.loading ? 'center' : '' }}>
            {upscaleApi.loading ? <>
                <CircularProgress />
            </> : <>
                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>

                    <FormControl fullWidth disabled={!pong?.SD}>
                        <InputLabel>Upscaler</InputLabel>
                        <Select
                            value={selectedUpscaler} onChange={(e) => setSelectedUpscaler(e.target.value)} size="small" label='Upscaler'
                            slotProps={{ root: { style: { fontSize: '.8em' } } }}
                        >
                            {upscalers?.map((u) => <MenuItem key={u} value={u} style={{ fontSize: '.8em' }}>{u}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <TextField
                        size="small" variant="outlined" label='Scale' type="number"
                        value={upscaleScale} onChange={(e) => setUpscaleScale(Number.parseFloat(e.target.value))}
                        slotProps={{ htmlInput: { step: '.5', style: { fontSize: '.8em' } } }} style={{ width: "100px" }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'end', marginTop: '5px', alignItems: 'center' }}>
                    <Button size="small" onClick={onUpscale} disabled={!updateImage || !pong?.SD}>Upscale {image?.hiResAvailable ? "Again" : ""}</Button>
                </div>
            </>}
        </div>
    </Card>

}