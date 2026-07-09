import { imageUrl } from "../../api/Images";
import { FilterOptions } from "../../model/FilterOptions";
import { GeneratedImage } from "../../model/GeneratedImage";
import { Model } from "../../model/Model";
import { Prompt } from "../../model/Prompt";
import Template from "../../model/Template";

export const NO_LORA_ALIAS = "NoUsedLoRAs"
export const ALL_LORA_ALIAS = "";
export const SPECIAL_LORA_ALIASES = [NO_LORA_ALIAS, ALL_LORA_ALIAS]

export function stringToColor(string: string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
}

export function RemoveIndex<T>(arr: T[], i: number) {
    const l = [] as T[]
    arr.forEach((a, ai) => {
        if (ai !== i) { l.push(a) }
    })

    return l;
}

export const dateFromBackend = (val: string): string => new Date(val).toISOString().split('T')[0]
export const dateToBackend = (val?: string): string | undefined => val && val.length > 0 ? new Date(val).toISOString().replace("Z", "") : undefined;

export const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

export const daysSince = (date: string): number => {
    // Parse the start date as UTC
    const startDate = new Date(Date.parse(date + "T00:00:00Z")); // Append 'T00:00:00Z' to ensure UTC
    // Get the current date in UTC
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

    // Calculate the difference in days
    const diffTime = todayUTC.getTime() - startDate.getTime(); // Milliseconds difference
    const diffDays = diffTime / (1000 * 60 * 60 * 24); // Convert to days

    return diffDays
}

export const addDays = (date: string, days: number): Date => {

    // Add X days in milliseconds (1 day = 86,400,000 ms)
    return new Date(new Date(Date.parse(date)).getTime() + (days * 24 * 60 * 60 * 1000));
}

export const daysUntil = (date: Date): number => {

    // Get today's date in UTC (ignoring the time part)
    const today: Date = new Date();
    const todayUTC: Date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    // Calculate the difference in milliseconds
    const diffTime: number = date.getTime() - todayUTC.getTime();

    // Convert to days and round down
    const diffDays: number = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;


}

export const availableVars = (prompt: Prompt) => {
    const matches = [...prompt.positivePrompt.matchAll(/%([^%]+)%/g)].map(m => m[0]);
    // Get unique values
    return [...new Set(matches)];
}

export const POSITIVE_SUFFIX_VARIABLE = "[CHAMOMILE_POSITIVE_PROMPT_SUFFIX]"
export const NEGATIVE_SUFFIX_VARIABLE = "[CHAMOMILE_NEGATIVE_PROMPT_SUFFIX]"

export const hydratePrompt = (prompt: Prompt, variables: Record<string, string>, index?: number) => {

    let hydrated = {}

    Object.keys(variables).forEach(key => {
        const raw = variables[key]
        if (!raw) return;

        if (key.includes("%")) {
            const parts = raw.split("|").map(p => p.trim()).filter(p => p.length > 0);
            if (parts.length === 0) return;

            const chosen = (typeof index === "number" && parts.length > 1)
                ? parts[index % parts.length]?.trim()
                : parts[0].trim();

            hydrated = { ...hydrated, [key]: chosen };
        } else {
            hydrated = { ...hydrated, [key]: raw };
        }
    });

    return { ...prompt, variables: hydrated } as Prompt;
}

export const promptPreview = (prompt: Prompt, variables: any, templates: Template[]) => {
    if (!prompt) return;
    if (!variables) return prompt.positivePrompt;


    //Get only the entries that start and end with __
    const wildcards = Object.fromEntries(Object.entries(variables).filter(([key, _]) =>
        key.startsWith("__") && key.endsWith("__")
    ))

    const overrides = Object.fromEntries(Object.entries(variables).filter(([key, _]) =>
        !key.startsWith("__") && !key.endsWith("__")
    ))

    return promptPreviewWithVars(
        promptPreviewWithVars(
            applyTemplatesToPrompt(
                applyPositivePromptSuffix(prompt.positivePrompt, variables[POSITIVE_SUFFIX_VARIABLE]), templates
            ), overrides
        ), wildcards
    )


}

export const TEMPLATE_CALL_REGEX = /\[([^:\]]+):([^\]]*)\]/g

const applyPositivePromptSuffix = (promptString: string, suffix?: string) => {
    return suffix ? `${promptString}\n\n${suffix}` : promptString
}

const applyTemplatesToPrompt = (
    promptString: string,
    templates: Template[]
): string => {

    return promptString?.replace(TEMPLATE_CALL_REGEX, (_, name, paramBlob) => {
        const template = templates.find(t => t.name.toUpperCase() === name.toUpperCase());
        if (!template) return ""; // or leave as-is

        const params = paramBlob.length > 0
            ? paramBlob.split("~")
            : [];

        return applyTemplate(template, params);
    });
};

const applyTemplate = (template: Template, paramList: string[]): string => {
    if (!template) return "";

    let applied = template.templateString;

    template.params.forEach((p, i) => {
        const replacement =
            i < paramList.length && paramList[i].trim() !== ""
                ? paramList[i]
                : p.default;

        applied = applied.replaceAll(`~${i + 1}`, replacement);
    });

    return applied;
};

const promptPreviewWithVars = (prompt: string, variables: any) => {
    const RECURSION_LIMIT = 10;
    let recursionCount = 0;
    let hydrated = prompt;

    while (Object.keys(variables).filter(a => hydrated.includes(a) && (variables[a] as string).trim().length !== 0)) {
        //We need to do this so that its caluclated before we enter the loop
        //Maybe funky things could happen if not
        var replacementList = Object.keys(variables).filter(a => hydrated.includes(a) && (variables[a] as string).trim().length !== 0);

        for (var replacement of replacementList) {
            hydrated = hydrated.replaceAll(replacement, variables[replacement]);
        }

        //Limit just in case
        recursionCount++;
        if (recursionCount > RECURSION_LIMIT) break;
    }


    return hydrated
}


export const objectToQueryString = (obj: any) => obj ? "?" + Object.keys(obj)
    .map((k) => {
        let value = obj[k];
        if (typeof value === "string") {
            value = value.replace(/&/g, "%26").replace(/=/g, "%3D").replace(/\?/g, "%3F");
        } else if (typeof value === "number" && Number.isNaN(value)) return null
        return `${k}=${value}`;
    })
    .join("&") : "";

export const clearFilter = (filter: FilterOptions): FilterOptions => ({ ...filter, favorite: false, upscaled: false, downloaded: false, fromDate: "", toDate: "", lora: '', model: '', lastImage: 0, query: '', sample: -1, sampleMode: undefined })

export const imageToPrompt = (image?: GeneratedImage, useBasePrompt?: boolean, reuseSeed?: boolean): Prompt => {
    return {
        cfgScale: image?.cfgScale,
        height: image?.height,
        width: image?.width,
        negativePrompt: image?.negativePrompt,
        positivePrompt: useBasePrompt ? image?.basePrompt : image?.prompt,
        sampler: image?.sampler,
        seed: reuseSeed ? image?.seed : -1,
        scheduleType: image?.scheduleType,
        steps: image?.steps,
        sampleImage: (image?.additionalInfo?.sample ?? 0) > 0 ? image?.additionalInfo?.sample : image?.id,
    } as Prompt
}

export const modelSorter = (a: Model, b: Model) => {
    const ta = a.tags?.[0]?.toLowerCase() ?? null;
    const tb = b.tags?.[0]?.toLowerCase() ?? null;
    if (ta === tb) return (a.name ?? '').localeCompare(b.name ?? '');
    if (ta === null) return -1; // place items without a tag before tagged items
    if (tb === null) return 1;
    return ta.localeCompare(tb);
}

export const downloadImage = (image?: GeneratedImage) => {
    const a = document.createElement('a');
    a.href = imageUrl(image?.id ?? 0) + ".png?CountDownload=true";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}