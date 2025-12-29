import { Drawer, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Select, Switch, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material"
import { useSettings } from "../../hooks/useSettings"
import { Coffee, DirectionsRun, Height, ThumbDown, Tune, VolumeUp } from "@mui/icons-material";
// import SchedulerSelector from "../prompt/SchedulerSelector";
import SamplerSelector from "../prompt/SamplerSelector";
import { useState } from "react";
import SizePresetSelector from "../prompt/SizePresetSelector";
import { ChamomileGlobalFlags } from "../../contexts/SettingsContext";
import { useUpscalers } from "../../hooks/useUpscalers";

export default function SettingsSlidein({ open, setOpen }: {
    open: boolean,
    setOpen: (val: boolean) => void
}) {

    const [sizePresetOpen, setSizePresetOpen] = useState(false)
    const { upscalers } = useUpscalers();
    const { settings, setSettings } = useSettings();

    const sounds = [
        { name: "Image generated", sound: "/sounds/imageDone.mp3" },
        { name: "Queue empty", sound: "/sounds/queueDone.ogg" },
        { name: "What's New", sound: "/sounds/wnew.mp3" }
    ]

    return <Drawer open={open} onClose={() => { setOpen(false) }} title="Settings" anchor="left">
        <div style={{ padding: "20px", width: "400px" }}>
            <div style={{ marginBottom: "10px", fontSize: "1.7em", fontFamily: "Merriweather" }}>
                Settings
            </div>

            {/* Sound */}
            <>
                <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "flex-end" }}>
                    <b>Sound</b>
                    <Switch checked={settings.enableSound} onChange={(_, checked) => setSettings({ ...settings, enableSound: checked })} size="small" />
                </div>
                <hr style={{ width: "100%" }} />
                <div style={{ marginBottom: "10px", fontSize: ".8em" }}>
                    Do you want to hear them?
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', rowGap: "10px", columnGap: "0px", flexWrap: "wrap", marginBottom: "20px" }}>
                    {sounds.map(a => <div key={a.name + "-sound"} style={{ display: 'flex', width: "50%", alignItems: 'center', fontSize: ".8em", gap: "10px" }}>
                        <IconButton onClick={() => { new Audio(a.sound).play() }} size="small"><VolumeUp fontSize="inherit" /></IconButton>
                        <div>{a.name}</div>
                    </div>)}
                </div>
            </>

            {/* Defaults */}
            <>
                <b>Defaults</b>
                <hr style={{ width: "100%" }} />
                <div style={{ marginBottom: "10px", fontSize: ".8em" }}>
                    These values will be loaded when you open Chamomile
                </div>

                <TextField
                    value={settings.defaults.negativePrompt}
                    onChange={(e) => setSettings({ ...settings, defaults: { ...settings.defaults, negativePrompt: e.target.value } })}
                    placeholder="Negative Prompt" multiline maxRows={8} minRows={4}
                    fullWidth slotProps={{
                        htmlInput: { style: { fontSize: '.8em', fontFamily: 'monospace' } },
                        input: {
                            startAdornment: (
                                <InputAdornment position="start"> <ThumbDown /> </InputAdornment>
                            ),
                        }
                    }}
                    style={{ marginBottom: "10px" }}
                />

                <div style={{ display: 'flex', flexDirection: 'row', rowGap: "10px", columnGap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>

                    {/* Amount */}
                    <TextField type="number"
                        value={settings.defaults.amount}
                        onChange={(e) => setSettings({ ...settings, defaults: { ...settings.defaults, amount: Math.max(parseInt(e.target.value), 1) } })}
                        placeholder="Amount"
                        fullWidth slotProps={{
                            input: {
                                startAdornment: (<InputAdornment position="start"> <Coffee /> </InputAdornment>),
                                endAdornment: (<InputAdornment position="end">Amount</InputAdornment>)
                            }
                        }}
                        style={{ width: "49%" }}
                    />

                    {/* Steps */}
                    <TextField type="number"
                        value={settings.defaults.steps} onChange={(e) => setSettings({ ...settings, defaults: { ...settings.defaults, steps: Math.max(parseInt(e.target.value), 1) } })}
                        placeholder="Steps"
                        fullWidth slotProps={{
                            input: {
                                startAdornment: (<InputAdornment position="start"> <DirectionsRun /> </InputAdornment>),
                                endAdornment: (<InputAdornment position="end">Steps</InputAdornment>)
                            }
                        }}
                        style={{ flex: 1 }}
                    />

                    {/* Width */}
                    <TextField type="number"
                        value={settings.defaults.width}
                        onChange={(e) => setSettings({ ...settings, defaults: { ...settings.defaults, width: Math.max(parseInt(e.target.value), 1) } })}

                        placeholder="Width"
                        fullWidth slotProps={{
                            htmlInput: { min: 1 },
                            input: {
                                startAdornment: (<InputAdornment position="start">
                                    <IconButton onClick={() => setSizePresetOpen(true)}><Height sx={{ transform: 'rotate(90deg)', margin: "-7px" }} /> </IconButton>
                                </InputAdornment>),
                                endAdornment: (<InputAdornment position="end">px</InputAdornment>)
                            }
                        }}
                        style={{ width: "49%" }}
                    />

                    {/* Height */}
                    <TextField type="number"
                        value={settings.defaults.height}
                        onChange={(e) => setSettings({ ...settings, defaults: { ...settings.defaults, height: Math.max(parseInt(e.target.value), 1) } })}
                        placeholder="Height"
                        fullWidth slotProps={{
                            htmlInput: { min: 1 },
                            input: {
                                startAdornment: (<InputAdornment position="start">
                                    <IconButton onClick={() => setSizePresetOpen(true)}><Height style={{ margin: "-7px" }} /> </IconButton>
                                </InputAdornment>),
                                endAdornment: (<InputAdornment position="end">px</InputAdornment>)
                            }
                        }}
                        style={{ flex: 1 }}
                    />

                    {/* CFG Scale */}
                    <TextField type="number"
                        value={settings.defaults.cfg} onChange={(e) => setSettings({ ...settings, defaults: { ...settings.defaults, cfg: parseFloat(e.target.value) } })}
                        placeholder="CFG Scale"
                        fullWidth slotProps={{
                            htmlInput: { min: 0.1, step: 0.1 },
                            input: {
                                startAdornment: (<InputAdornment position="start"> <Tune /> </InputAdornment>),
                                endAdornment: (<InputAdornment position="end">CFG Scale</InputAdornment>)
                            }
                        }}
                    />

                    {/* <SchedulerSelector
                        scheduler={settings.defaults.scheduler}
                        setScheduler={(s) => { setSettings({ ...settings, defaults: { ...settings.defaults, scheduler: s } }) }}
                    /> */}

                    <SamplerSelector
                        sampler={settings.defaults.sampler}
                        setSampler={(s) => { setSettings({ ...settings, defaults: { ...settings.defaults, sampler: s } }) }}
                    />
                </div>
            </>

            {/* Tile Sizes */}
            <>
                <b>Tile Sizes</b>
                <hr style={{ width: "100%" }} />
                <div style={{ marginBottom: "10px", fontSize: ".8em" }}>
                    What size should we display image tiles at?
                </div>
                <div style={{ marginBottom: "20px" }}>
                    <ToggleButtonGroup
                        value={settings?.tileSize} exclusive onChange={(_, val) => setSettings({ ...settings, tileSize: val })}
                        fullWidth
                    >
                        <ToggleButton value="XS" selected={settings?.tileSize === "XS"} >
                            XS
                        </ToggleButton>
                        <ToggleButton value="SM" selected={settings?.tileSize === "SM"} >
                            SM
                        </ToggleButton>
                        <ToggleButton value="MD" selected={!settings.tileSize || settings?.tileSize === "MD"}>
                            MD
                        </ToggleButton>
                        <ToggleButton value="LG" selected={settings?.tileSize === "LG"} >
                            LG
                        </ToggleButton>
                        <ToggleButton value="XL" selected={settings?.tileSize === "XL"} >
                            XL
                        </ToggleButton>
                    </ToggleButtonGroup>
                </div>
            </>

            {/* Upscaler Settings */}
            <>
                <b>Upscaling</b>
                <hr style={{ width: "100%" }} />
                <div style={{ marginBottom: "20px", fontSize: ".8em" }}>
                    Chose an upscaler and scale to upscale images by. You can also change these
                    settings on the Upscaling accordion on the image viewer
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>

                    <FormControl fullWidth>
                        <InputLabel>Upscaler</InputLabel>
                        <Select
                            value={settings.upscaleSettings?.upscaler} onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    upscaleSettings: { ...settings?.upscaleSettings, upscaler: e.target.value }
                                })
                            } label='Upscaler'
                            slotProps={{ root: { style: { fontSize: '.8em' } } }}
                        >
                            {upscalers?.map((u) => <MenuItem key={u} value={u} style={{ fontSize: '.8em' }}>{u}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <TextField
                        variant="outlined" label='Scale' type="number"
                        value={settings.upscaleSettings?.scale ?? 4} onChange={(e) => setSettings({
                            ...settings,
                            upscaleSettings: { ...settings?.upscaleSettings, scale: Number.parseFloat(e.target.value) }
                        })}
                        slotProps={{ htmlInput: { step: '.5', style: { fontSize: '.8em' } } }} style={{ width: "100px" }}
                    />
                </div>
            </>

            {/* Globals */}
            <>
                <b>Globals</b>
                <hr style={{ width: "100%" }} />
                <div style={{ marginBottom: "10px", fontSize: ".8em" }}>
                    Values marked as global will not be overridden when requesting to re-brew or re-use the prompt of an image.
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', rowGap: "10px", columnGap: "0px", flexWrap: "wrap" }}>
                    {(Object.keys(new ChamomileGlobalFlags())).map((key) => (
                        <div key={key} style={{ display: 'flex', gap: "16px", alignItems: 'center', width: "50%" }}>
                            <Switch
                                checked={(settings.globals as any)[key]}
                                onChange={(_, checked) => setSettings({ ...settings, globals: { ...settings.globals, [key]: checked } })}
                                size="small"
                            />
                            <div style={{ fontSize: ".8em" }}>
                                {key === "cfg" ? <>CFG</> : key === "negativePrompt" ? <>Negative Prompt</> : <>{key[0].toUpperCase()}{key.substring(1)}</>}
                            </div>
                        </div>
                    ))}
                </div>
            </>

        </div>

        <SizePresetSelector
            open={sizePresetOpen} setOpen={setSizePresetOpen}
            setSize={(width, height) => { setSettings({ ...settings, defaults: { ...settings.defaults, width: width, height: height } }) }}
        />

    </Drawer>

}