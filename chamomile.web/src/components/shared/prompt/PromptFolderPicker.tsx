import { Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material"
import { useEffect, useState } from "react"
import useApi from "../../hooks/useApi"
import { getPrompts } from "../../../api/Prompts"
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view"
import { Folder, Storage } from "@mui/icons-material"

export default function PromptFolderPicker(props: {
    folder: string
    setFolder: (val: string) => void
    open: boolean
    setOpen: (val: boolean) => void
}) {

    const { folder, setFolder, open, setOpen } = props

    const [internalFolder, setInternalFolder] = useState(folder)

    useEffect(() => {
        if (open) { setInternalFolder(folder) }
    }, [open])

    const { loading, data } = useApi(getPrompts, true)

    const folders = [...new Set<string>(data?.map(a => a.name)
        .filter(a => a.includes("/"))
        .map(a => a.split("/").slice(0, -1).join("/"))
        .sort((a, b) => a.localeCompare(b)))]

    const buildTree = (paths: string[]) => {
        const root: any = {}
        for (const path of paths) {
            const parts = path.split('/')
            let node = root
            for (const part of parts) {
                node[part] = node[part] || {}
                node = node[part]
            }
        }
        return root
    }

    function renderTree(node: any, path = '') {
        return Object.keys(node).map((key) => {
            const currentPath = path ? `${path}/${key}` : key
            return (
                <TreeItem
                    key={currentPath}
                    itemId={currentPath}
                    label={<div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <Folder />
                        <div>{key}</div>
                    </div>}
                    onClick={(e) => {
                        console.log(currentPath)
                        setInternalFolder(currentPath)
                        e.stopPropagation()
                    }}
                >
                    {renderTree(node[key], currentPath)}
                </TreeItem>
            )
        })
    }

    return <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>

        <DialogTitle>Select a Folder</DialogTitle>
        <DialogContent>
            <TextField value={internalFolder} onChange={(e) => setInternalFolder(e.target.value)} fullWidth style={{ marginBottom: "10px" }} />
            <Card elevation={6}>
                <CardContent style={{ height: "50vh", overflow: "auto" }}>
                    {loading ? <div style={{ height: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <CircularProgress />
                    </div> : <>
                        <SimpleTreeView>
                            <TreeItem
                                key={""}
                                itemId={""}
                                label={<div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                    <Storage />
                                    <div>Root</div>
                                </div>}
                                onClick={() => setInternalFolder("")}
                            >
                                {renderTree(buildTree(folders))}
                            </TreeItem>
                        </SimpleTreeView>
                    </>}

                </CardContent>
            </Card>

        </DialogContent>
        <DialogActions>
            <Button onClick={() => { setOpen(false) }}>Cancel</Button>
            <Button onClick={() => { setOpen(false); setFolder(internalFolder) }}>OK</Button>
        </DialogActions>

    </Dialog>

}