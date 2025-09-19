import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CheckIcon from "@mui/icons-material/Check";
import { ContentPaste } from "@mui/icons-material";

export default function CopyToClipboardButton({ text, style }: {
    text?: string, style?: React.CSSProperties
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text ?? "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return <Tooltip title={copied ? "Copied!" : "Copy to Clipboard"}>
        <IconButton onClick={handleCopy} color={copied ? "success" : "default"} style={style}>
            {copied ? <CheckIcon fontSize="small" /> : <ContentPaste fontSize="small" />}
        </IconButton>
    </Tooltip>

}