import { Button, Card, CardActionArea, Dialog, DialogContent, DialogTitle, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import Template from "../../../model/Template";
import useApi from "../../hooks/useApi";
import { createTemplate, deleteTemplate, updateTemplate } from "../../../api/Template";
import { Add, Delete, HelpOutline } from "@mui/icons-material";
import { imageUrl } from "../../../api/Images";
import { useMemo, useState } from "react";
import ImageBrowserModal from "../images/ImageBrowserModal";
import { useSnackbar } from "notistack";
import AreYouSureModal from "../modals/AreYouSureModal";

export default function TemplateEditor({ open, onClose, mode, template, setTemplate, existingTemplates }: {
    existingTemplates: Template[],
    open: boolean,
    onClose: (dirty: boolean) => void,
    mode: "create" | "edit",
    template: Template
    setTemplate: (template: Template) => void
}) {


    const [imageBrowserOpen, setImageBrowserOpen] = useState(false)
    const [deleteAys, setDeleteAys] = useState(false)
    const { enqueueSnackbar } = useSnackbar();

    const existingName = useMemo(() => mode === "create" && template && existingTemplates.some(a => a.name.toLowerCase() === template.name.toLowerCase()), [template?.name, mode])

    const templateApi = useApi(mode === "create" ? createTemplate : updateTemplate)
    const deleteApi = useApi(deleteTemplate)

    if (!template) return <></>

    return <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogTitle>{mode === "create" ? "Create Template" : `Edit Template: ${template.name}`}</DialogTitle>
        <DialogContent style={{ height: "90vh", display: 'flex', gap: '10px', flexDirection: 'column', overflowY: 'hidden' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div>
                    <Card style={{ width: "175px", height: '175px' }}><CardActionArea onClick={() => setImageBrowserOpen(true)}>
                        <img
                            key={template.sampleImage}
                            src={template?.sampleImage ? imageUrl(template.sampleImage) : '/outline.png'}
                            style={{
                                width: '175px', height: '175px',
                                objectFit: 'cover', objectPosition: 'center top'
                            }}
                        />
                    </CardActionArea></Card>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <TextField
                        label="Name" value={template.name}
                        onChange={(e) => setTemplate({ ...template, name: e.target.value.replace(/[:\]~]/g, "") })}
                        fullWidth style={{ marginTop: "5px" }} disabled={mode === "edit"}
                        error={existingName} helperText={existingName ? "Template with this name already exists" : "This name is permanent and is a unique identifier"}
                    />
                    <TextField
                        label="Description" value={template.description}
                        onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                        fullWidth multiline rows={2}
                    />
                </div>
            </div>
            <div style={{ marginTop: "10px" }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>Parameters</div>
                    <Tooltip title={<div>
                        <div style={{ fontSize: '1.3em', fontWeight: "600" }}>What's this?</div>
                        <div>
                            These are the parameters for this template. You can specify some documentation and description
                            which will be provided to you when you invoke this template in the Dynamics window, or when
                            auto-completing prompts.
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            Each parameter will be filled in its corresponding placeholder in the
                            template string ( <span style={{ backgroundColor: 'rgba(0,0,0,.2)', padding: '2px 5px' }}>~1</span>
                            , <span style={{ backgroundColor: 'rgba(0,0,0,.2)', padding: '2px 5px' }}>~2</span>, etc.).
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            Learn more about templates on our Help documentation.
                        </div>
                    </div>}>
                        <HelpOutline fontSize="small" />
                    </Tooltip>
                </div>
                <hr style={{ width: "100%" }} />
            </div>
            <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', padding: "10px" }}>
                {template.params.map((param, index) => <Card elevation={3} style={{ flexShrink: 0, display: 'flex', gap: '10px', alignItems: 'center', padding: '5px' }}>
                    <IconButton onClick={() => {
                        setTemplate({
                            ...template,
                            params: [...template.params].map((a, i) => i === index
                                ? undefined
                                : a).filter(a => !!a)
                        }
                        )
                    }} size="small">
                        <Delete fontSize="small" />
                    </IconButton>
                    <div style={{ fontFamily: 'monospace', width: '40px', textAlign: 'center' }}>
                        ~{index + 1}
                    </div>
                    <TextField
                        label="Name" value={param.name} size="small"
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                                style: { scale: ".8" }
                            }
                        }}
                        onChange={(e) => {
                            setTemplate({
                                ...template,
                                params: [...template.params].map((a, i) => i === index
                                    ? { ...a, name: e.target.value }
                                    : a)
                            }
                            )
                        }} style={{ flex: 1 }}
                    />
                    {/* <TextField
                        label="Description" value={param.description} variant="standard"
                        onChange={(e) => {
                            setTemplate({
                                ...template,
                                params: [...template.params].map((a, i) => i === index
                                    ? { ...a, description: e.target.value }
                                    : a)
                            }
                            )
                        }} fullWidth
                    /> */}
                    <TextField
                        label="Default" value={param.default} size="small"
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                                style: { scale: ".8" }
                            }
                        }}
                        onChange={(e) => {
                            setTemplate({
                                ...template,
                                params: [...template.params].map((a, i) => i === index
                                    ? { ...a, default: e.target.value }
                                    : a)
                            }
                            )
                        }} style={{ flex: 1 }}
                    />

                </Card>)}
                <Card elevation={3} style={{ flexShrink: 0 }}>
                    <CardActionArea style={{ padding: "10px" }} onClick={() => {
                        setTemplate({
                            ...template, params: [...template.params, {
                                name: "", default: "", description: ""
                            }]
                        })
                    }}>
                        <Typography fontSize={"1em"} fontWeight={"600"} color="primary" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <Add />
                            <div>
                                ADD A NEW PARAMETER
                            </div>

                        </Typography>
                    </CardActionArea>

                </Card>
            </Card>
            <div style={{ marginTop: "10px" }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>Template string</div>
                    <Tooltip title={<div>
                        <div style={{ fontSize: '1.3em', fontWeight: "600" }}>What's this?</div>
                        <div>
                            This is the base template string. Use
                            placeholders <span style={{ backgroundColor: 'rgba(0,0,0,.2)', padding: '2px 5px' }}>~1</span>
                            , <span style={{ backgroundColor: 'rgba(0,0,0,.2)', padding: '2px 5px' }}>~2</span>, etc. to represent
                            the parameters in the order they are listed above. Each placeholder will be replaced
                            with the corresponding value when the function is applied.
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            Learn more about templates on our Help documentation.
                        </div>
                    </div>}>
                        <HelpOutline fontSize="small" />
                    </Tooltip>
                </div>
                <hr style={{ width: "100%" }} />
            </div>
            <div>
                <TextField
                    value={template.templateString}
                    onChange={(e) => setTemplate({ ...template, templateString: e.target.value })}
                    fullWidth multiline minRows={4} maxRows={6}
                    placeholder="Man made of translucent ~1 skin, ~1 body"
                    slotProps={{
                        input: {
                            style: { fontFamily: 'monospace', fontSize: '.8em' }
                        }
                    }}
                />
            </div>


        </DialogContent>
        <div style={{ padding: "0px 8px 16px 8px", display: 'flex', gap: "5px" }}>
            <div style={{ flex: '1' }}>
                {mode === "edit" && <Button
                    color="error" startIcon={<Delete />}
                    onClick={() => setDeleteAys(true)}
                    variant="outlined" style={{ marginLeft: '16px' }}>
                    Delete template
                </Button>}

            </div>
            <Button onClick={() => onClose(false)}>Cancel</Button>
            <Button onClick={() => {
                templateApi.fetch(() => {
                    enqueueSnackbar("Template saved!", { variant: 'success' })
                    onClose(true)
                }, (error) => {
                    console.error(error)
                    enqueueSnackbar("Template could not saved", { variant: 'error' })
                }, template)
            }} disabled={existingName}>{mode === "create" ? "Create" : "Save"}</Button>
        </div>

        <ImageBrowserModal open={imageBrowserOpen} setOpen={setImageBrowserOpen} onOk={(a) => {
            setTemplate({ ...template, sampleImage: a.id })
            setImageBrowserOpen(false)
        }} />

        <AreYouSureModal open={deleteAys} setOpen={setDeleteAys} onYes={() => {
            deleteApi.fetch(() => {
                enqueueSnackbar("Template deleted!", { variant: 'success' })
                setDeleteAys(false)
                onClose(true)
            }, (error) => {
                console.error(error)
                enqueueSnackbar("Template could not deleted", { variant: 'error' })
            }, template.name)
        }}>
            Are you sure you want to delete this template?
        </AreYouSureModal>

    </Dialog>

}