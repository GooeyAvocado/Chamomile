import { Autocomplete, Box, CircularProgress, IconButton, InputAdornment, TextField } from "@mui/material";
import { GridView, ModelTraining } from "@mui/icons-material";
import { imageUrl } from "../../../api/Images";
import React, { useState } from "react";
import { Lora } from "../../../model/Lora";
import { useLoras } from "../../hooks/useLoras";
import LoraBrowserModal from "./LoraBrowserModal";
import ModelTypePill from "../model/ModelType/ModelTypePill";
import { NO_LORA_ALIAS, SPECIAL_LORA_ALIASES } from "../Utils";

export default function LoraSelector(props: {
    lora: string,
    setLora: (val: Lora) => void
    style?: React.CSSProperties

    /**Show an option to select "All" and "No" LoRAs */
    showAll?: boolean
}) {

    const { lora, setLora, style, showAll } = props;
    const { loading, loras } = useLoras();

    const [browserOpen, setBrowserOpen] = useState(false)

    const onSelect = (lora: Lora) => {
        if (Lora)
            setLora(lora)
    }


    return <>
        <Autocomplete key={lora} disableClearable
            freeSolo loading={loading} loadingText={loading ? "Loading..." : "Type to begin"}
            getOptionLabel={(option) => (option as Lora)?.name ?? ""}
            options={showAll ? [{
                alias: '',
                bannerImage: undefined,
                name: 'All',
                isAvailable: true
            } as Lora,
            {
                alias: NO_LORA_ALIAS,
                bannerImage: undefined,
                name: 'None',
                isAvailable: true
            } as Lora, ...(loras ?? [])] : loras?.filter(a => a.isAvailable) ?? []}
            style={style} value={loras?.find(a => a.alias === lora)}
            onChange={(_, value) => { onSelect(value as Lora) }}
            renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                    <Box
                        // key={key}
                        component="li"
                        {...optionProps}
                        style={{ display: "flex", gap: '20px' }}
                    >
                        <img loading="lazy" src={option.alias === NO_LORA_ALIAS ? "/outlinepadded-no.png" : option.bannerImage ? imageUrl(option.bannerImage) : "/outlinepadded.png"} style={{ width: "32px", height: "32px", objectFit: 'cover', objectPosition: 'center top', borderRadius: '5px' }} />
                        <div style={{ color: option.isAvailable ? "white" : "#777" }}>
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                {option?.type?.length > 0 && <ModelTypePill type={option?.type} />}
                                <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-end' }}>
                                    <b>{option.name}</b>
                                </div>
                            </div>
                            {!SPECIAL_LORA_ALIASES.includes(option.alias) && <div style={{ fontSize: ".8em" }}>{option.isAvailable ? option.alias : "Unavailable"}</div>}
                        </div>

                    </Box>
                );
            }}
            renderInput={(params: any) =>
                <TextField {...params}
                    placeholder={NO_LORA_ALIAS === lora ? "None" : lora ?? ""} variant="outlined"
                    label='Lora'
                    slotProps={{
                        input: {
                            ...params.InputProps,
                            startAdornment: (
                                <InputAdornment position="start">
                                    {loading ? <CircularProgress color="inherit" size={25} /> : <ModelTraining />}
                                </InputAdornment>
                            ),
                            endAdornment: (<InputAdornment position="end">
                                <IconButton onClick={() => setBrowserOpen(true)}>
                                    <GridView />
                                </IconButton>
                            </InputAdornment>),

                        }
                    }} />}

            slotProps={{
                popper: {
                    modifiers: [
                        {
                            name: 'setWidth',
                            enabled: true,
                            phase: 'beforeWrite',
                            requires: ['computeStyles'],
                            fn: ({ state }) => {
                                state.styles.popper.minWidth = "500px"
                            },
                        },
                    ],
                },
            }}

        />
        <LoraBrowserModal onOk={(val) => {
            onSelect(val)
            setBrowserOpen(false)
        }} open={browserOpen} setOpen={setBrowserOpen} showAny={showAll} />
    </>

}