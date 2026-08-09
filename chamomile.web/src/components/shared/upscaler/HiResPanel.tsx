import { Button, Card, CircularProgress, FormControl, InputLabel, MenuItem, Select, TextField, Tooltip } from "@mui/material";
import { GeneratedImage } from "../../../model/GeneratedImage";
import { useUpscalers } from "../../hooks/useUpscalers";
import { usePingPong } from "../../hooks/usePingPong";
import { Gradient } from "@mui/icons-material";

export default function HiResPanel(props: {
    image?: GeneratedImage
    updateImage?: (val: GeneratedImage) => void
}) {

    const { pong } = usePingPong();

    const { image, updateImage } = props
    const {
        selectedUpscaler, setSelectedUpscaler,
        setUpscaleScale, upscaleScale,
        upscaleLoading,
        upscalers, onUpscale
    } = useUpscalers()

    return <Card elevation={7}>
        <div style={{ padding: '0px 10px', height: "60px", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: upscaleLoading ? 'center' : '' }}>
            {upscaleLoading ? <>
                <CircularProgress />
            </> : <>
                <div style={{ display: 'flex', gap: '10px' }}>

                    <FormControl fullWidth disabled={!pong?.SD} style={{ flex: "1" }}>
                        <InputLabel>Upscaler</InputLabel>
                        <Select
                            value={selectedUpscaler} onChange={(e) => setSelectedUpscaler(e.target.value)} size="small" label='Upscaler'
                            slotProps={{ root: { style: { fontSize: '1em' } } }}
                        >
                            {upscalers?.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                        </Select>
                    </FormControl>



                    <TextField
                        size="small" variant="outlined" label='Scale' type="number"
                        value={upscaleScale} onChange={(e) => setUpscaleScale(Number.parseFloat(e.target.value))}
                        slotProps={{ htmlInput: { step: '.5', style: { fontSize: '1em', textAlign: "center" } } }} style={{ width: "56px" }}
                    />

                    <Tooltip title={image?.hiResAvailable ? "Re-Upscale" : "Upscale"}>
                        <Button
                            fullWidth style={{ width: "0px" }} variant="outlined"
                            onClick={() => { onUpscale(image ?? {} as GeneratedImage, updateImage) }}
                            disabled={!updateImage || !pong?.SD || selectedUpscaler === "None"}
                        >
                            <Gradient />
                        </Button>
                    </Tooltip>
                </div>
            </>}
        </div>
    </Card>

}