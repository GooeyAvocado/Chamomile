import { Autocomplete, Box, CircularProgress, InputAdornment, TextField } from "@mui/material";
import { useModels } from "../../hooks/useModels";
import { Model } from "../../../model/Model";
import { ModelTraining } from "@mui/icons-material";
import { imageUrl } from "../../../api/Images";
import React from "react";

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
    

    const onSelect = (model: Model) => {
        setModel(model)
    }


    return <Autocomplete disabled={disabled}
        freeSolo loading={loading || externalLoading} loadingText={loading ? "Loading..." : "Type to begin"}
        getOptionLabel={(option) => (option as Model)?.name ?? ""}
        options={showNone ? [{
            title:'',
            bannerImage : undefined,
            name:'All'
        } as Model, ...models] : models ?? []}
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
                    <img src={option.bannerImage ? imageUrl(option.bannerImage) : "/outlinepadded.png"} style={{width:"96px", height:"96px", objectFit:'cover', objectPosition:'center top', borderRadius:'5px'}}/>
                    <div>
                        <div><b>{option.name}</b></div>
                        <div>{option.title}</div>
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
                        </InputAdornment>),
                        disableUnderline: true
                    }
                }} />}

    />

}