import { Autocomplete, Box, CircularProgress, IconButton, InputAdornment, TextField } from "@mui/material";
import { useModels } from "../../hooks/useModels";
import { Model } from "../../../model/Model";
import { GridView, ModelTraining } from "@mui/icons-material";
import { imageUrl } from "../../../api/Images";
import React, { useState } from "react";
import ModelBrowserModal from "./ModelBrowserModal";
import ModelTypePill from "./ModelType/ModelTypePill";

export default function ModelSelector(props: {
    model: string,
    setModel: (val: Model) => void
    style?: React.CSSProperties
    showNone?: boolean
    disabled?: boolean
    loading?: boolean
    error?: boolean
    helperText?: string
}) {

    const { model, setModel, style, showNone, disabled, loading: externalLoading, error } = props;
    const { loading, models } = useModels();
    const [browserOpen, setBrowserOpen] = useState(false)


    const onSelect = (model: Model) => {
        setModel(model)
    }


    return <>
        <Autocomplete disabled={disabled} key={model} disableClearable
            freeSolo loading={loading || externalLoading} loadingText={loading ? "Loading..." : "Type to begin"}
            getOptionLabel={(option) => (option as Model)?.name ?? ""}
            options={showNone ? [{
                title: '',
                bannerImage: undefined,
                name: 'All',
                isAvailable: true
            } as Model, ...(models ?? [])] : models?.filter(a => a.isAvailable) ?? []}
            style={style} value={models?.find(a => a.title === model)}
            onChange={(_, value) => { onSelect(value as Model) }}
            renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                    <Box
                        component="li"
                        {...optionProps}
                        style={{ display: "flex", gap: '20px' }}
                    >
                        <img loading="lazy" src={option.bannerImage ? imageUrl(option.bannerImage) : "/outlinepadded.png"} style={{ width: "32px", height: "32px", objectFit: 'cover', objectPosition: 'center top', borderRadius: '5px' }} />
                        <div style={{ color: option.isAvailable ? "white" : "#777" }}>
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                {option?.type?.length > 0 && <ModelTypePill type={option?.type} />}
                                <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-end' }}>
                                    <b>{option.name}</b>
                                </div>
                            </div>
                            <div style={{ fontSize: ".8em" }}>{option.isAvailable ? option.title : "Unavailable"}</div>
                        </div>

                    </Box>
                );
            }}
            renderInput={(params: any) =>
                <TextField {...params}
                    placeholder={model ?? ""} variant="outlined"
                    label='Checkpoint' error={error}
                    slotProps={{
                        input: {
                            ...params.InputProps,
                            startAdornment: (
                                <InputAdornment position="start">
                                    {loading || externalLoading ? <CircularProgress color="inherit" size={25} /> : <ModelTraining />}
                                </InputAdornment>
                            ),
                            endAdornment: (<InputAdornment position="end">
                                <IconButton onClick={() => setBrowserOpen(true)} disabled={disabled || loading || externalLoading}>
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
        }} open={browserOpen} setOpen={setBrowserOpen} showNone={showNone} />
    </>

}