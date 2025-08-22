import React from "react";

export type HighlightRule = {
    regex: RegExp;
    style?: React.CSSProperties;
    renderer?: (val: string) => React.ReactNode
};

export type HighlightedTextProps = {
    text?: string;
    highlights: HighlightRule[];
    style?: React.CSSProperties
};

export function HighlightedDiv({ text, highlights, style }: HighlightedTextProps) {
    if (!highlights.length) return <>{text}</>;

    // Build a single regex that matches any of the rules
    const combinedRegex = new RegExp(
        highlights.map(h => `(${h.regex.source})`).join("|"),
        "g"
    );

    // Split text into parts
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    text?.replace(combinedRegex, (match, ...args) => {
        const offset = args[args.length - 2]; // match index
        if (lastIndex < offset) {
            parts.push(text.slice(lastIndex, offset)); // normal text before match
        }

        // Find which regex matched
        const ruleIndex = highlights.findIndex(h => match.match(h.regex));
        const style = highlights[ruleIndex]?.style ?? {};
        const renderer = highlights[ruleIndex]?.renderer;

        parts.push(
            renderer ? renderer(match)
                : <span key={offset} style={style}>
                    {match}
                </span>
        );

        lastIndex = offset + match.length;
        return match;
    });

    // Push the rest of the text
    if (lastIndex < (text?.length ?? 0)) {
        parts.push(text?.slice(lastIndex));
    }

    return <div style={style}>
        {parts}
    </div>

}
