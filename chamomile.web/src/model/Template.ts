export default interface Template {
    name: string,
    description: string,
    params: TemplateParam[]
    templateString: string,
    sampleImage?: number
}

export interface TemplateParam {
    name: string,
    description: string,
    default: string
}