import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { usePingPong } from '../../hooks/usePingPong';
import { Dialog, DialogActions, DialogContent, DialogTitle, Divider, Tooltip } from '@mui/material';
import PreviewModal from './preview/PreviewModal';
import { usePrompt } from '../../hooks/usePrompt';
import { QuestionMark, Yard } from '@mui/icons-material';
import { useRef, useState } from 'react';

export default function PromptButton(props: {
    onBrew: (amountOverride?: number) => void
    onSaveAs: () => void
    onSave: () => void
    onLoad: () => void
    saveAsEnabled?: boolean
    fullWidth?: boolean
}) {

    const { onBrew, onLoad, onSave, fullWidth, onSaveAs, saveAsEnabled } = props
    const { prompt, orderAmount } = usePrompt();

    const [open, setOpen] = useState(false);
    const [seedWarning, setSeedWarning] = useState(false)
    const [previewOpen, setPreviewOpen] = useState(false);

    const anchorRef = useRef<HTMLDivElement>(null);
    const { pong } = usePingPong()

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return <>
        <ButtonGroup
            variant="contained"
            ref={anchorRef}
            fullWidth={fullWidth}
        >
            <Tooltip title={!pong?.SD ? 'Kitchen\'s closed\n(Could not contact SD)' : 'Click to start brewing images'}>
                <Button onClick={() => {
                    if (prompt.seed > -1 && orderAmount > 1) setSeedWarning(true)
                    else onBrew()
                }} disabled={!pong?.SD}>Brew</Button>
            </Tooltip>
            <Button size="small" style={{ width: '40px' }} onClick={handleToggle} >
                <ArrowDropDownIcon />
            </Button>
        </ButtonGroup>

        <Popper sx={{ zIndex: 2 }} open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
            {({ TransitionProps, placement }) => (
                <Grow {...TransitionProps} style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom', }} >
                    <Paper>
                        <ClickAwayListener onClickAway={handleClose}>
                            <MenuList id="split-button-menu" >
                                <MenuItem key={"BrewSingleButton"} style={{ fontSize: ".8em" }} disabled={!pong?.SD} onClick={() => {
                                    handleClose();
                                    onBrew(1)
                                }} >
                                    Single Brew
                                </MenuItem>
                                <MenuItem key={"PreviewPromptButton"} style={{ fontSize: ".8em" }} disabled={!pong?.SD} onClick={() => {
                                    handleClose();
                                    setPreviewOpen(true);
                                }} >
                                    Preview Recipe
                                </MenuItem>
                                <Divider />
                                <MenuItem key={"SavePromptButton"} style={{ fontSize: ".8em" }} onClick={() => {
                                    handleClose();
                                    onSave();
                                }} >
                                    Save this recipe
                                </MenuItem>
                                {saveAsEnabled && <MenuItem key={"SaveAsPromptButton"} style={{ fontSize: ".8em" }} onClick={() => {
                                    handleClose();
                                    onSaveAs();
                                }} >
                                    Save this recipe as...
                                </MenuItem>}
                                <MenuItem key={"LoadPromptButton"} style={{ fontSize: ".8em" }} onClick={() => {
                                    handleClose();
                                    onLoad();
                                }} >
                                    Load a recipe
                                </MenuItem>
                            </MenuList>
                        </ClickAwayListener>
                    </Paper>
                </Grow>
            )}
        </Popper>

        <PreviewModal open={previewOpen} setOpen={setPreviewOpen} />
        <Dialog open={seedWarning} onClick={() => { setSeedWarning(false) }} maxWidth="sm" fullWidth>
            <DialogTitle>
                Are you sure you want to order more than one image?
            </DialogTitle>
            <DialogContent>
                There's a <span style={{ display: "inline-flex", alignItems: "center", verticalAlign: 'middle', gap: "10px" }}>
                    <Yard /> Seed
                </span> set for this prompt. All {orderAmount} images will be the same
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    setSeedWarning(false)
                    onBrew(1)
                }}>Brew a single image</Button>
                <Button onClick={() => setSeedWarning(false)}>No</Button>

                <Button onClick={() => {
                    setSeedWarning(false)
                    onBrew();
                }}>Yes</Button>
            </DialogActions>
        </Dialog>
    </>

}