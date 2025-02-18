import { Autocomplete, Box, CircularProgress, InputAdornment, TextField } from "@mui/material";
import { ModelTraining } from "@mui/icons-material";
import { imageUrl } from "../../../api/Images";
import React from "react";
import { Lora } from "../../../model/Lora";
import { useLoras } from "../../hooks/useLoras";

export default function LoraSelector(props:{
    lora:string,
    setLora: (val:Lora)=>void
    style?: React.CSSProperties
    showNone?:boolean
}) {

    const {lora, setLora, style,showNone} = props;
    const { loading, loras } = useLoras();
    

    const onSelect = (lora: Lora) => {
        setLora(lora)
    }


    return <Autocomplete
        freeSolo loading={loading} loadingText={loading ? "Loading..." : "Type to begin"}
        getOptionLabel={(option) => (option as Lora)?.name ?? ""}
        options={showNone ? [{
            alias:'',
            bannerImage : undefined,
            name:'All'
        } as Lora, ...(loras ?? [])] : loras?.filter(a => a.isAvailable) ?? []}
        style={style}
        onChange={(_, value) => { onSelect(value as Lora) }}
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
                        <div>{option.alias}</div>
                    </div>

                </Box>
            );
        }}
        renderInput={(params: any) =>
            <TextField {...params}
                placeholder={lora ?? ""} variant="outlined"
                label='Lora'
                slotProps={{
                    input: {
                        ...params.InputProps,
                        startAdornment: (
                            <InputAdornment position="start">
                                {loading  ? <CircularProgress color="inherit" size={25} /> : <ModelTraining />}
                            </InputAdornment>
                        ),
                        endAdornment: (<InputAdornment position="end">
                        </InputAdornment>),
                        disableUnderline: true
                    }
                }} />}

    />

}