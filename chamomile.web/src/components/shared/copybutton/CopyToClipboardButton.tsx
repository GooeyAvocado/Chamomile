import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CheckIcon from "@mui/icons-material/Check";
import { ContentPaste } from "@mui/icons-material";
import { ListItemIcon, MenuItem } from "@mui/material";

export default function CopyToClipboardButton({ text, style, menuButonMode }: {
    text?: string, style?: React.CSSProperties, menuButonMode?: boolean
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text ?? "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (menuButonMode) {
        return <MenuItem onClick={handleCopy}>
            <ListItemIcon>{copied ? <CheckIcon fontSize="small" /> : <ContentPaste fontSize="small" />}</ListItemIcon>
            {copied ? "Copied!" : "Copy to clipboard"}
        </MenuItem>
    }

    return <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
        <IconButton onClick={handleCopy} color={copied ? "success" : "default"} style={style}>
            {copied ? <CheckIcon fontSize="small" /> : <ContentPaste fontSize="small" />}
        </IconButton>
    </Tooltip>

}