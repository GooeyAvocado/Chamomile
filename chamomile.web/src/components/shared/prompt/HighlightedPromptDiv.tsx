import React, { useMemo } from "react";
import { HighlightedDiv, HighlightRule } from "../highlightedDiv/HighlightedDiv"
import { Card } from "@mui/material";
import { useLoras } from "../../hooks/useLoras";
import { imageUrl } from "../../../api/Images";

export default function HighlightedPromptDiv({ prompt, style }: {
    prompt?: string
    style?: React.CSSProperties
}) {

    function extractVariableDeclarations(text: string): Record<string, string> {
        const regex = /\$\{([a-zA-Z0-9_]+)=([^}]*)\}/g;
        const result: Record<string, string> = {};

        let match;
        while ((match = regex.exec(text)) !== null) {
            const [, name, value] = match;
            result[name] = value; // last declaration wins if repeated
        }

        return result;
    }

    const { loras } = useLoras()

    const variables = useMemo(() => {
        return extractVariableDeclarations(prompt ?? "")
    }, [prompt])

    const commentColor = "#5e8b4eff"

    const variableColors = [
        "#FF8A65", // orange
        "#4FC3F7", // blue
        "#81C784", // green
        "#BA68C8", // purple
        "#FFD54F", // amber
        "#F06292", // pink
        "#90A4AE", // grey-blue
        "#AED581", // lime
        "#7986CB", // indigo
        "#FFB74D", // deep orange
    ];

    function escapeRegex(str: string) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    return <HighlightedDiv
        text={prompt}
        style={{
            fontSize: ".7em", fontFamily: 'monospace', whiteSpace: 'pre-wrap',
            wordWrap: 'break-word', padding: "10px", ...style
        }}
        highlights={[

            //Loras
            {
                regex: /<lora:[^>]+>/,
                renderer: (val) => {

                    // parse out the LoRA title
                    const loraAlias = val.match(/<lora:([^>]+):[^>]+>/)?.[1]
                    const lora = loras?.find(a => a.id === loraAlias)

                    return <Card style={{ display: "inline-flex", padding: "2px 5px", alignItems: 'center', alignSelf: "center", gap: "5px", verticalAlign: 'middle' }} elevation={2}>
                        <img src={lora?.bannerImage ? imageUrl(lora?.bannerImage) : "/color.png"} width={16} />
                        <div style={{ color: lora?.isAvailable ? "white" : "#777777" }}>{val}</div>
                    </Card>
                }

            },

            { regex: /\/\*.*\*\//, style: { color: commentColor } },
            { regex: /#.*/, style: { color: commentColor } },
            { regex: /\/\/.*/, style: { color: commentColor } },

            ...Object.keys(variables).map((a, i) => ({
                regex: RegExp(`\\$\\{${escapeRegex(a)}=[^}]+\\}`),
                style: { color: variableColors[i % variableColors.length] }
            } as HighlightRule)),

            ...Object.keys(variables).map((a, i) => ({
                regex: RegExp(`\\$\\{${escapeRegex(a)}\\}`),
                style: { color: variableColors[i % variableColors.length] }
            } as HighlightRule)),

            //Wildcards
            { regex: /(?<!\=)__((?:(?!__).)+)__/, style: { backgroundColor: "#112255", borderRadius: "2px", padding: "2px 5px" } },


            //
        ]}
    />

}