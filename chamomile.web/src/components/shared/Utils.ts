import { GeneratedImage } from "../../model/GeneratedImage";
import { Prompt } from "../../model/Prompt";


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

export const availableVars = (prompt:Prompt) => {
    const matches = [...prompt.positivePrompt.matchAll(/%([^%]+)%/g)].map(m => m[1]);
        // Get unique values
        return [...new Set(matches)];
}

export const hydratePrompt = (prompt:Prompt, variables:any, index?: number) => {
     let hydrated = prompt.positivePrompt;
     Object.keys(variables).forEach(key=>{
          const val =   variables[key].split('|')
          let replaceVal = val[0]
          if(val.length > 0 && index){
            console.log(index % val.length)
            replaceVal = val[index % val.length]
          }
          hydrated = hydrated.replaceAll("\%" + key + "\%", replaceVal)
     });
     
     return {...prompt, positivePrompt:hydrated.trim()} as Prompt;
}

export const objectToQueryString = (obj: any) => obj ? "?" + Object.keys(obj)
    .map((k) => `${k}=${obj[k]}`)
    .join("&") : "";

export const currencies = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    PHP: "₽",
    MEX: "MX$",
    AUD: "AU$",
} as any

export const imageToPrompt = (image?:GeneratedImage, reuseSeed?:boolean) : Prompt => {
    return {
        cfgScale: image?.cfgScale,
        height: image?.height,
        width: image?.width,
        negativePrompt: image?.negativePrompt,
        positivePrompt: image?.prompt,
        sampler: image?.sampler,
        seed: reuseSeed ? image?.seed : -1,
        scheduleType: image?.scheduleType,
        steps: image?.steps,
        sampleImage: image?.id
    } as Prompt
}