export class FilterOptions {
    query?: string = "";
    album?: number = -1;
    grid?: number = -1;
    lora?: string = "";
    model?: string = "";
    favorite?: boolean = false;
    upscaled?: boolean = false;
    downloaded?: boolean = false;
    fromDate?: string = "";
    toDate?: string = "";
    lastImage?: number = 0;
    disablePagination?: boolean = false
}
