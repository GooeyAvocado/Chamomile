import { ReactNode } from "react"
import GeneralStatistics from "../../../../model/GeneralStatistics"
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"
import { Biotech, Category, HelpCenter, HistoryEdu, MenuBook, Psychology, Science } from "@mui/icons-material"

export default function SourceStats({ data }: {
    data: GeneralStatistics
}) {

    const sources = Object.entries(data?.countBySource ?? {}).sort((a, b) => b[1] - a[1])
    const mostCommonSource = sources?.[0]?.[0] ?? "UNKNOWN"

    const directorTypes = {
        "IMAGE_BASE": {
            name: "Existing Image Bases",
            type: "The Dream Weaver",
            attribute: "Curious",
            description: "You like to return to the roots of an image — the base prompt before random chance stepped in — so you can explore all the hidden paths it could have taken.",
            icon: <Psychology fontSize="inherit" />
        },
        "IMAGE": {
            name: "Existing Images",
            type: "The Refiner",
            attribute: "Focused",
            description: "You see something you like and push it further, maybe with different models or other light tweaks",
            icon: <Biotech fontSize="inherit" />
        },
        "SAVED_PROMPT": {
            name: "Recipes",
            type: "The Cookbook Writer",
            attribute: "Methodical",
            description: "You already know what the best parameters are, and you've had many of them saved! Your process is about consistency and mastery.",
            icon: <MenuBook fontSize="inherit" />
        },
        "PROMPTBOX": {
            name: "Prompt Box",
            type: "The Master Chef",
            attribute: "Creative",
            description: "You know how to improvise, and never like to see the same thing twice. Every prompt is a fresh dish, served with flair.",
            icon: <HistoryEdu fontSize="inherit" />
        },
        "UNKNOWN": {
            name: "Unknown",
            type: "The OG",
            attribute: "Mysterious",
            description: "You've generated a lot of images before we had the source feature. You must've been here for a bit ;3",
            icon: <HelpCenter fontSize="inherit" />
        },
        "UPLOAD": {
            name: "Uploads",
            type: "The Collector",
            attribute: "Eclectic",
            description: "Chamoile is your database of treasures collected from many different places. You curate, remix, and draw inspiration from across the web.",
            icon: <Category fontSize="inherit" />
        },
        "GRID": {
            name: "Grids",
            type: "The Scientist",
            attribute: "Technical",
            description: "You like to experiment, making little tweaks to see what the best combination of parameters are for each image. Controlled chaos is your lab.",
            icon: <Science fontSize="inherit" />
        }
    } as Record<string, {
        name: string,
        type: string,
        attribute: string,
        description: string,
        icon: ReactNode
    }>

    const directorType = directorTypes[mostCommonSource] ?? {
        name: "Actually unknown",
        attribute: "???",
        description: "Something happened and we can't determine what you are!",
        type: "???"
    }

    return <>
        <div style={{ flex: "1", overflowY: 'auto', display: "flex", gap: "10px", flexDirection: 'column', textAlign: 'center', marginTop: "12px" }}>

            <div>
                <div style={{ fontFamily: 'merriweather' }}>
                    <div style={{ fontSize: ".7em" }}>You are</div>
                    <div style={{ fontSize: "64px", marginBottom: "-20px" }}>{directorType.icon}</div>
                    <div style={{ fontSize: "2em" }}> ~~ {directorType.type} ~~ </div>
                    <div style={{ fontSize: ".9em" }}>({directorType.attribute})</div>
                </div>
                <div style={{ fontSize: ".7em", width: "300px", margin: "auto" }}>
                    {directorType.description}
                </div>

                <TableContainer component={Paper} style={{ width: "400px", margin: "20px auto" }} >
                    <Table >
                        <TableHead>
                            <TableCell>Source</TableCell>
                            <TableCell>Images</TableCell>
                        </TableHead>
                        <TableBody>
                            {sources.map(a => <TableRow>
                                <TableCell>{directorTypes[a[0]]?.name}</TableCell>
                                <TableCell>{a[1].toLocaleString()}</TableCell>
                            </TableRow>)}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>


        </div>
    </>
}