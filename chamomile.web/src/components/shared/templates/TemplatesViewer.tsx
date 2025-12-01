import { Assignment, ContentCopy, Delete, Edit, Search } from "@mui/icons-material"
import { Button, Card, CardActionArea, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, TextField, Typography } from "@mui/material"
import useApi from "../../hooks/useApi"
import { deleteTemplate, getTemplates } from "../../../api/Template"
import Template from "../../../model/Template"
import { useEffect, useState } from "react"
import { imageUrl } from "../../../api/Images"
import TemplateEditor from "./TemplateEditor"
import ContextMenu from "../ContextMenu"
import { useSnackbar } from "notistack"
import AreYouSureModal from "../modals/AreYouSureModal"

export default function TemplatesViewer({ open, onClose }: {
    open: boolean,
    onClose: (dirty: boolean) => void
}) {

    const { enqueueSnackbar } = useSnackbar();

    const [filter, setFilter] = useState("")
    const [dirty, setDirty] = useState(false)
    const [editTempalte, setEditTemplate] = useState<Template>()
    const [templateEditorMode, setTemplateEditorMode] = useState<"create" | "edit">("create")
    const [templateEditorOpen, setTemplateEditorOpen] = useState(false)
    const [deleteAys, setDeleteAys] = useState<Template>()

    useEffect(() => {
        if (open) { setDirty(false) }
    }, [open])

    const templatesApi = useApi(getTemplates, true)
    const deleteApi = useApi(deleteTemplate);

    return <>
        <Dialog open={open} onClose={() => onClose(dirty)} maxWidth="sm" fullWidth>
            <DialogTitle>Templates</DialogTitle>
            <DialogContent>
                <div style={{ height: "70vh", overflowY: "hidden", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <TextField
                        slotProps={{
                            input: {
                                startAdornment:
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                            }
                        }}
                        placeholder="Search templates..."
                        fullWidth
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                    <hr style={{ width: "100%" }} />
                    {templatesApi.loading ?
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: "20px" }}>
                            <CircularProgress />
                            <div>Loading templates...</div>
                        </div>
                        : <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: "5px" }}>
                            <TemplateCard
                                template={{ name: "Create a new template", description: "Create a new template from scratch", templateString: "", params: [] } as Template}
                                onClick={() => {
                                    setEditTemplate({ name: "", description: "", templateString: "", params: [] })
                                    setTemplateEditorMode("create")
                                    setTemplateEditorOpen(true)
                                }}

                            />
                            {templatesApi.data?.filter(
                                filter.trim().length === 0 ? (_) => true :
                                    t =>
                                        t.name.toLowerCase().includes(filter.toLowerCase()) ||
                                        t.description?.toLowerCase().includes(filter.toLowerCase()) ||
                                        t.templateString.toLowerCase().includes(filter.toLowerCase())
                            ).map(a => <ContextMenu options={[
                                {
                                    icon: <Edit />,
                                    text: "Edit",
                                    onClick: () => {
                                        setEditTemplate({ ...a })
                                        setTemplateEditorMode("edit")
                                        setTemplateEditorOpen(true)
                                    }
                                },
                                {
                                    icon: <ContentCopy />,
                                    text: "Duplicate",
                                    onClick: () => {
                                        setTemplateEditorOpen(true);
                                        setTemplateEditorMode("create")
                                        setEditTemplate({ ...a })
                                    }
                                },
                                {
                                    type: "divider"
                                },
                                {
                                    icon: <Delete />,
                                    text: "Delete",
                                    onClick: () => setDeleteAys(a)
                                }
                            ]}>
                                <TemplateCard
                                    key={a.name}
                                    template={a}
                                    onClick={() => {
                                        //make a copy
                                        setEditTemplate({ ...a })
                                        setTemplateEditorMode("edit")
                                        setTemplateEditorOpen(true)
                                    }}
                                />
                            </ContextMenu>)}

                        </div>}

                </div>

            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose(dirty)}>OK</Button>
            </DialogActions>
        </Dialog>

        <AreYouSureModal open={!!deleteAys} setOpen={() => setDeleteAys(undefined)} onYes={() => {
            deleteApi.fetch(() => {
                enqueueSnackbar("Template deleted!", { variant: 'success' })
                setDeleteAys(undefined)
                setDirty(true);
                templatesApi.fetch();
            }, (error) => {
                console.error(error)
                enqueueSnackbar("Template could not deleted", { variant: 'error' })
            }, deleteAys?.name)
        }}>
            Are you sure you want to delete this template?
        </AreYouSureModal>

        <TemplateEditor
            existingTemplates={templatesApi.data ?? []}
            open={templateEditorOpen}
            mode={templateEditorMode}
            template={editTempalte!}
            setTemplate={setEditTemplate!}
            onClose={(dirty) => {
                setTemplateEditorOpen(false)
                if (dirty) {
                    templatesApi.fetch()
                    setDirty(true)

                }
            }}
        />
    </>

}

function TemplateCard({ template, onClick }: {
    template: Template
    onClick: () => void
}) {
    return <Card style={{ width: "100%", flexShrink: 0 }}>
        <CardActionArea onClick={onClick} sx={{ textTransform: 'none' }}>
            <div style={{ padding: '20px', display: 'flex', gap: "20px" }}>
                {template.sampleImage ? <img
                    src={imageUrl(template.sampleImage)}
                    style={{ width: "64px", objectFit: 'cover', height: '64px', borderRadius: '2px' }}
                /> : <div style={{
                    width: '64px', height: '64px', borderRadius: '2px', backgroundColor: "#2F2F2F",
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Assignment fontSize="large" />
                </div>}
                <div style={{ flex: 1 }}>
                    <Typography>
                        {template.name}
                    </Typography>
                    <hr />
                    <Typography style={{ fontSize: '.8em' }}>
                        {template.description && template.description.length > 0 ? template.description : template.templateString}
                    </Typography>
                </div>
            </div>
        </CardActionArea>
    </Card>
}