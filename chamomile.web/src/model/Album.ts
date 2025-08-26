export interface Album {

    id?: number,
    thumbId?: number,
    firstFourImages?: number[]
    name: string,
    searchQuery: string,
    count?: number
    newest?: string,
    oldest?: string
    hideFromTimeline?: boolean

}