import { FileDownload, FileUpload, Delete } from "@mui/icons-material"
import { IconButton, Tooltip } from "@mui/material"
import { useSnackbar } from "notistack"

export default function IECControls({ value, setValue, type, nonPlural }: {
    value?: object
    setValue: (val: object) => void
    type: string
    nonPlural?: boolean
}) {

    const { enqueueSnackbar } = useSnackbar();

    const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        try {
            const json = JSON.parse(text);
            if (typeof json === "object" && json !== null) {
                enqueueSnackbar(`Loaded ${type}${nonPlural ? "" : "s"}!`, { variant: "success" });
                setValue(json);
            } else {
                enqueueSnackbar("Invalid JSON format.", { variant: "warning" });
            }
        } catch {
            enqueueSnackbar("Failed to parse JSON.", { variant: 'error' });
        }
        e.target.value = "";
    }

    const onExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(value, null, 4));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", type + `${nonPlural ? "" : "s"}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    return <div style={{ display: 'flex', gap: '5px' }}>

        <Tooltip title={`Import ${type}${nonPlural ? "" : "s"}`}>
            <IconButton component="label" color="primary" >
                <FileUpload />
                <input type="file" accept="application/json" hidden onChange={onImport} />
            </IconButton>
        </Tooltip>

        {Object.keys(value ?? {}).length > 0 && <>

            <hr />

            <Tooltip title={`Export ${type}${nonPlural ? "" : "s"}`}>
                <IconButton onClick={onExport} color="primary">
                    <FileDownload />
                </IconButton>
            </Tooltip>

            <Tooltip title={`Clear ${nonPlural ? "" : "all "}${type}${nonPlural ? "" : "s"}`}>
                <IconButton onClick={() => setValue({})} color="primary"><Delete /></IconButton>
            </Tooltip>
        </>}
    </div>

}