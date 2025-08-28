export interface Grid {
    /** ID of the image on DB */
    id?: number;

    name: string;

    /** Prompt returned from A111 after generation */
    prompt: string;

    /** Notes left by the user post generation */
    notes?: string;

    /** Negative prompt returned from A111 after generation */
    negativePrompt: string;

    /** Steps used to generate */
    steps: number;

    /** Sampler used to generate */
    sampler: string;

    /** Scheduler used to generate */
    scheduleType: string;

    /** CFG Scale used to generate */
    cfgScale: number;

    /** Seed used to generate */
    seed: number;

    /** Height of the image. Replaced on HiRes */
    height: number;

    /** Width of the image. Replaced on HiRes */
    width: number;

    /** How long it took to generate the image in ms */
    generationDurationMs?: number;

    /** Mode to use the vals in XVals */
    xValMode: string;

    /** Values along the X axis */
    xVals: string[];

    /** Mode to use the vals in YVals */
    yValMode: string;

    /** Values along the y axis of this */
    yVals: string[];

    firstFour?: number[];

    /** When this image was created */
    created?: Date;
}