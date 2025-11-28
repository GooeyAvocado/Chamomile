import { Autocomplete, Box, CircularProgress, IconButton, InputAdornment, TextField } from "@mui/material";
import { GridView, ModelTraining } from "@mui/icons-material";
import { imageUrl } from "../../../api/Images";
import React, { useState } from "react";
import ModelTypePill from "./ModelType/ModelTypePill";
import { Model, ModelType } from "../../../model/Model";
import ModelBrowserModal from "./ModelBrowserModal";
import { NO_LORA_ALIAS, SPECIAL_LORA_ALIASES } from "../Utils";

export default function ModelSelector(props: {
    model: string,
    setModel: (val: Model) => void
    loading?: boolean
    models?: Model[],
    modelType: ModelType,
    style?: React.CSSProperties
    showAll?: boolean
    showNone?: boolean
    showAvailability?: boolean
    disabled?: boolean
    error?: boolean
    helperText?: string
    onRefresh: (deep?: boolean) => void
}) {

    const { model, setModel, style, showAll, disabled, loading, error, modelType, models, onRefresh, showAvailability, showNone } = props;
    const [browserOpen, setBrowserOpen] = useState(false)


    const onSelect = (model: Model) => {
        setModel(model)
    }


    return <>
        <Autocomplete disabled={disabled} key={model} disableClearable
            freeSolo loading={loading} loadingText={loading ? "Loading..." : "Type to begin"}
            getOptionLabel={(option) => (option as Model)?.name ?? ""}
            options={[showAll ? {
                id: '',
                bannerImage: undefined,
                name: 'All',
                isAvailable: true
            } as Model : undefined,
            showNone ? {
                id: NO_LORA_ALIAS,
                bannerImage: undefined,
                name: 'None',
                isAvailable: true
            } as Model : undefined, ...(models ?? [])].filter(a => !!a).filter(
                showAvailability ? _ => true : a => a.isAvailable
            )}
            style={style} value={models?.find(a => a.id === model)}
            onChange={(_, value) => { onSelect(value as Model) }}
            renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                    <Box
                        component="li"
                        {...optionProps}
                        style={{ display: "flex", gap: '20px' }}
                    >
                        <img loading="lazy"
                            src={option.id === NO_LORA_ALIAS ? "/outlinepadded-no.png" : option.bannerImage ? imageUrl(option.bannerImage) : "/outlinepadded.png"}
                            style={{ width: "32px", height: "32px", objectFit: 'cover', objectPosition: 'center top', borderRadius: '5px' }} />
                        <div style={{ color: option.isAvailable ? "white" : "#777" }}>
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                {option?.type?.length > 0 && <ModelTypePill type={option?.type} />}
                                <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-end' }}>
                                    <b>{option.name}</b>
                                </div>
                            </div>
                            {!SPECIAL_LORA_ALIASES.includes(option.id) && <div style={{ fontSize: ".8em" }}>{option.isAvailable ? option.id : "Unavailable"}</div>}
                        </div>

                    </Box>
                );
            }}
            renderInput={(params: any) =>
                <TextField {...params}
                    placeholder={NO_LORA_ALIAS === model ? "None" : model ?? ""} variant="outlined"
                    label={modelType} error={error}
                    slotProps={{
                        input: {
                            ...params.InputProps,
                            startAdornment: (
                                <InputAdornment position="start">
                                    {loading ? <CircularProgress color="inherit" size={25} /> : <ModelTraining />}
                                </InputAdornment>
                            ),
                            endAdornment: (<InputAdornment position="end">
                                <IconButton onClick={() => setBrowserOpen(true)} disabled={disabled || loading}>
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
        <ModelBrowserModal onOk={(val) => {
            onSelect(val)
            setBrowserOpen(false)
        }} open={browserOpen} setOpen={setBrowserOpen} showAny={showAll} showAvailability={showAvailability}
            models={models} modelType={modelType} loading={loading} onRefresh={onRefresh}
        />
    </>

}