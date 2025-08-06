import { Autocomplete, InputAdornment, ListItemIcon, MenuItem, TextField } from "@mui/material";
import { getSamplers } from "../../../api/Prompts";
import useApi from "../../hooks/useApi";
import { Bolt, Explore, Image, Palette, Window } from "@mui/icons-material";
import Sampler from "../../../model/Automatic1111/Sampler";
import React, { useMemo } from "react";


interface GroupedSampler extends Sampler {
    group?: string
    title?: string
    desc?: string
    icon?: React.ReactNode

}

export default function SamplerSelector(props: {
    sampler: string,
    setSampler: (val: string) => void
    style?: React.CSSProperties
}) {

    const { sampler, setSampler, style } = props
    const { data } = useApi(getSamplers, true)

    const groupedSamplers = useMemo(() => {

        const samplers = data?.sort((a, b) => a.name.localeCompare(b.name)).map(a => ({
            ...a,
            group: "Other Samplers",
        } as GroupedSampler))

        const presets = [{
            name: "UniPC",
            title: "Fast",
            desc: "The newest sampler able to generate images in fewer steps",
            group: "Common Samplers",
            icon: <Bolt />
        }, {
            name: "Euler Dy",
            title: "Styled",
            desc: "Often resolves to simpler, more cartoony images",
            group: "Common Samplers",
            icon: <Palette />
        }, {
            name: "DPM++ 2M",
            title: "Standard",
            desc: "Balances speed and quality",
            group: "Common Samplers",
            icon: <Explore />
        }, {
            name: "DPM2",
            title: "Quality",
            desc: "Slower, but often produces sharper, more realistic images",
            group: "Common Samplers",
            icon: <Image />
        }] as GroupedSampler[]

        return [
            ...presets.filter(a => samplers?.some(b => a.name === b.name)),
            ...(samplers?.filter(
                a => !presets.some(b => a.name === b.name)
            ) ?? [])
        ].filter(a => !!a)

    }, [data])

    return <Autocomplete key={sampler} disableClearable
        freeSolo fullWidth
        getOptionLabel={(option) => (option as GroupedSampler)?.name ?? ""}
        options={groupedSamplers ?? [{
            name: sampler
        }] as GroupedSampler[]} groupBy={(o) => (o as GroupedSampler).group ?? ""}
        style={style} value={data?.find(a => a.name === sampler)}
        onChange={(_, value) => { setSampler((value as GroupedSampler).name) }}
        renderOption={(props, option) => {
            const { key, ...optionProps } = props;
            const o = option as GroupedSampler
            return <MenuItem key={key} component="li" {...optionProps} >
                {o.title ? <>
                    <ListItemIcon>{o.icon}</ListItemIcon>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: "2px" }}>
                        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                            <div>{o.title}</div>
                            <div style={{ fontSize: ".7em", opacity: ".7" }}>({o.name})</div>
                        </div>
                        <div style={{ fontSize: ".7em ", opacity: ".8" }}>{o.desc}</div>

                    </div>
                </> : o.name}
            </MenuItem>

        }}
        renderInput={(params: any) =>
            <TextField {...params}
                placeholder={sampler ?? ""} variant="outlined"
                slotProps={{
                    input: {
                        ...params.InputProps,
                        startAdornment: <InputAdornment position="start" >
                            <Window />
                        </InputAdornment>,

                        endAdornment: <InputAdornment position="end">
                            <div style={{ marginRight: "15px", opacity: ".8" }}>Sampler</div>
                        </InputAdornment>
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


}