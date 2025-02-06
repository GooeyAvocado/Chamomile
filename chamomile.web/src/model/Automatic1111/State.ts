export class State {
    skipped: boolean = false;
    interrupted: boolean = false;
    stopping_generation: boolean = false;
    job: string = "";
    job_count: number = 0;
    jobTimestamp: string = "";
    jobNo: number = 0;
    sampling_step: number = 0;
    sampling_steps: number = 0;
}
