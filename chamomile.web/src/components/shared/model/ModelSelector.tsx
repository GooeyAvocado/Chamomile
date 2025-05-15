import { Autocomplete, Box, CircularProgress, IconButton, InputAdornment, TextField } from "@mui/material";
import { useModels } from "../../hooks/useModels";
import { Model } from "../../../model/Model";
import { GridView, ModelTraining } from "@mui/icons-material";
import { imageUrl } from "../../../api/Images";
import React, { useState } from "react";
import ModelBrowserModal from "./ModelBrowserModal";
import ModelTypePill from "./ModelType/ModelTypePill";

export default function ModelSelector(props:{
    model:string,
    setModel: (val:Model)=>void
    style?: React.CSSProperties
    showNone?:boolean
    disabled?:boolean
    loading?: boolean
}) {

    const {model, setModel, style,showNone, disabled, loading : externalLoading} = props;
    const { loading, models } = useModels();
    const [browserOpen, setBrowserOpen] = useState(false)
    

    const onSelect = (model: Model) => {
        setModel(model)
    }


    return <>
    <Autocomplete disabled={disabled}
        freeSolo loading={loading || externalLoading} loadingText={loading ? "Loading..." : "Type to begin"}
        getOptionLabel={(option) => (option as Model)?.name ?? ""}
        options={showNone ? [{
            title:'',
            bannerImage : undefined,
            name: 'All',
            isAvailable:true
        } as Model, ...(models ?? [])] : models?.filter(a => a.isAvailable) ?? []}
        style={style}
        onChange={(_, value) => { onSelect(value as Model) }}
        renderOption={(props, option) => {
            const { key, ...optionProps } = props;
            return (
                <Box
                    key={key}
                    component="li"
                    {...optionProps}
                    style={{ display: "flex", gap:'20px' }}
                >
                    <img src={option.bannerImage ? imageUrl(option.bannerImage) : "/outlinepadded.png"} style={{width:"32px", height:"32px", objectFit:'cover', objectPosition:'center top', borderRadius:'5px'}}/>
                    <div style={{color:option.isAvailable ? "white" : "#777"}}>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            {option?.type?.length > 0 && <ModelTypePill type={option?.type}/>}
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-end' }}>
                                <b>{option.name}</b>
                            </div>
                        </div>
                        <div style={{fontSize:".8em"}}>{option.isAvailable ? option.title : "Unavailable"}</div>
                    </div>

                </Box>
            );
        }}
        renderInput={(params: any) =>
            <TextField {...params}
                placeholder={model ?? ""} variant="outlined"
                label='Model'
                slotProps={{
                    input: {
                        ...params.InputProps,
                        startAdornment: (
                            <InputAdornment position="start">
                                {loading || externalLoading  ? <CircularProgress color="inherit" size={25} /> : <ModelTraining />}
                            </InputAdornment>
                        ),
                        endAdornment: (<InputAdornment position="end">
                            <IconButton onClick={()=>setBrowserOpen(true)}>
                                <GridView/>
                            </IconButton>
                        </InputAdornment>),
                        disableUnderline: true
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
                                state.styles.popper.minWidth="500px"
                            },
                        },
                    ],
                },
            }}

    />
    <ModelBrowserModal onOk={(val)=>{
        onSelect(val)
        setBrowserOpen(false)
    }} open={browserOpen} setOpen={setBrowserOpen} showNone={showNone}/>
    </>

}