export const usePageTitle = ()=>{

    const setPageTitle = (t?:string) => {
        const subtitle = t && t.trim().length > 0 ? ` - ${t}` : "";
        document.title = "Chamomile" + subtitle
    }

    return setPageTitle


}