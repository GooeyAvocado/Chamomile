import { Card, CardActionArea, Dialog, DialogContent, DialogTitle } from "@mui/material";

export default function SizePresetSelector(props: {
    open: boolean,
    setOpen: (val: boolean) => void
    setSize: (width: number, height: number) => void
}) {
    const { open, setOpen, setSize } = props

    const presets = [
        { name: 'SD Square', width: 512, height: 512 },
        { name: 'SDXL Square', width: 1024, height: 1024 },
        { name: 'SDXL Wide', width: 1152, height: 896 },
        { name: 'SDXL Tall', width: 896, height: 1152 },
        { name: 'SDXL Extra Wide', width: 1216, height: 832 },
        { name: 'SDXL Extra Tall', width: 832, height: 1216 },
        { name: 'SDXL Super Wide', width: 1344, height: 768 },
        { name: 'SDXL Super Tall', width: 768, height: 1344 },
        { name: 'SDXL Ultra Wide', width: 1536, height: 640 },
        { name: 'SDXL Ultra Tall', width: 640, height: 1536 },
    ]

    return <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle><div style={{ fontSize: '.8em' }}>Set a Size Preset</div></DialogTitle>
        <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '75vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: '0' }}>
                {presets.map(a => <Card key={a.name}><CardActionArea
                    onClick={() => {
                        setSize(a.width, a.height);
                        setOpen(false);
                    }}
                    style={{ padding: "5px", display: 'flex', gap: '5px', fontWeight: 'bold', fontSize: '1em', alignItems: 'center' }}
                >
                    <img src={`/images/sizes/${a.width}x${a.height}.png`} style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
                    <div style={{ flex: '1' }}>{a.name} ({a.width}x{a.height})</div>
                </CardActionArea></Card>)}
            </div>
        </DialogContent>
    </Dialog>
}