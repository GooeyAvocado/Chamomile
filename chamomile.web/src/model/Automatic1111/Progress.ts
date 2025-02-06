import { State } from "./State";

export class Progress {
    progress: number = 0.0;
    eta_relative: number = 0.0;
    state: State = new State();
    current_image: string = "";
}
