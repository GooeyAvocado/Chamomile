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
import { Dialog, DialogActions, DialogContent, DialogTitle, Divider, ListItemIcon, Tooltip } from '@mui/material';
import PreviewModal from './preview/PreviewModal';
import { usePrompt } from '../../hooks/usePrompt';
import { Casino, Coffee, FileOpen, GridView, Preview, Save, SaveAs, Yard } from '@mui/icons-material';
import { useRef, useState } from 'react';
import GridEditor from '../grids/GridEditor';
import { Grid } from '../../../model/Grid';
import useApi from '../../hooks/useApi';
import { createGrid } from '../../../api/Grid';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import RandomImageModal from '../images/RandomImageModal';
import { FilterOptions } from '../../../model/FilterOptions';
import useModifierKeys from '../../hooks/useModifierKeys';

export default function PromptButton(props: {
    onBrew: (amountOverride?: number) => void
    onSaveAs: () => void
    onSave: () => void
    onLoad: () => void
    filter?: FilterOptions
    setFilter?: (val: FilterOptions) => void
    saveAsEnabled?: boolean
    fullWidth?: boolean
    reducedOptions?: boolean
}) {

    const { onBrew, onLoad, onSave, fullWidth, onSaveAs, saveAsEnabled, filter, setFilter, reducedOptions } = props
    const { prompt, orderAmount } = usePrompt();

    const [open, setOpen] = useState(false);
    const [seedWarning, setSeedWarning] = useState(false)
    const [previewOpen, setPreviewOpen] = useState(false);
    const { shiftHeld } = useModifierKeys();
    const [brewHovered, setBrewHovered] = useState(false)

    const [gridEditorState, setGridEditorState] = useState<Grid>()
    const [gridEditorOpen, setGridEditorOpen] = useState(false);

    const { fetch: create, loading: createLoading } = useApi(createGrid)
    const anchorRef = useRef<HTMLDivElement>(null);
    const { enqueueSnackbar } = useSnackbar();
    const { pong } = usePingPong()
    const nav = useNavigate();

    const [luckyOpen, setLuckyOpen] = useState(false)
    const [luckyEverOpen, setLuckyEverOpen] = useState(false)

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const onEditorOk = () => {
        if (!gridEditorState) return;
        if (gridEditorState.xValMode === "NON" && gridEditorState.yValMode === "NON") {
            enqueueSnackbar("Please specify at least one axis!", { variant: "error" })
            return;
        }

        if (gridEditorState.xValMode === "NON") { gridEditorState.xVals = [""] } else {
            if (gridEditorState.xVals.length === 0) {
                enqueueSnackbar("Please specify at least one X axis value!", { variant: "error" })
                return;
            }
        }

        if (gridEditorState.yValMode === "NON") { gridEditorState.yVals = [""] } else {
            if (gridEditorState.yVals.length === 0) {
                enqueueSnackbar("Please specify at least one Y axis value!", { variant: "error" })
                return;
            }
        }

        create((val) => {
            enqueueSnackbar("Grid created!", { variant: "success" })
            nav(`/grid/${val?.id}`)
            setGridEditorOpen(false)
        }, () => {
            enqueueSnackbar("Could not create grid", { variant: "error" })
        }, { ...gridEditorState, seed: Math.floor(Math.random() * 1000000000), generationDurationMs: 0 } as Grid)
    }

    const showRush = brewHovered && shiftHeld

    return <>
        <ButtonGroup
            variant="contained"
            ref={anchorRef}
            fullWidth={fullWidth}
        >
            <Tooltip title={showRush ? "Brew this prompt immediately" : 'Click to start brewing images'}>
                <Button onMouseEnter={() => setBrewHovered(true)} onMouseLeave={() => setBrewHovered(false)} onClick={() => {
                    if (prompt.seed > -1 && orderAmount > 1) setSeedWarning(true)
                    else onBrew()
                }} disabled={!pong?.SD}
                    color={showRush ? 'warning' : 'primary'}
                    variant={showRush ? 'outlined' : 'contained'}
                >
                    <div style={{ width: "32px" }}>
                        {showRush ? "Rush" : "Brew"}
                    </div>
                </Button>
            </Tooltip>
            <Button size="small" style={{ width: '40px' }} onClick={handleToggle} >
                <ArrowDropDownIcon />
            </Button>
        </ButtonGroup>

        <Popper sx={{ zIndex: 2 }}
            open={open} anchorEl={anchorRef.current}
            role={undefined} transition disablePortal
            popperOptions={{
                placement: "bottom-end"
            }}
        >
            {({ TransitionProps, placement }) => (
                <Grow {...TransitionProps} style={{ transformOrigin: placement === 'bottom-end' ? 'center top' : 'center bottom', }} >
                    <Paper>
                        <ClickAwayListener onClickAway={handleClose}>
                            <MenuList id="split-button-menu" >
                                <MenuItem key={"BrewSingleButton"} style={{ fontSize: ".8em" }} disabled={!pong?.SD} onClick={() => {
                                    handleClose();
                                    onBrew(1)
                                }} >
                                    <ListItemIcon><Coffee fontSize='small' /></ListItemIcon>
                                    Single brew
                                </MenuItem>
                                {!reducedOptions && <MenuItem key={"PreviewPromptButton"} style={{ fontSize: ".8em" }} disabled={!pong?.SD} onClick={() => {
                                    handleClose();
                                    setPreviewOpen(true);
                                }} >
                                    <ListItemIcon><Preview fontSize='small' /></ListItemIcon>
                                    Preview recipe
                                </MenuItem>}
                                <Divider />
                                <MenuItem key={"SavePromptButton"} style={{ fontSize: ".8em" }} onClick={() => {
                                    handleClose();
                                    onSave();
                                }} >
                                    <ListItemIcon><Save fontSize='small' /></ListItemIcon>
                                    Save this recipe
                                </MenuItem>
                                {saveAsEnabled && <MenuItem key={"SaveAsPromptButton"} style={{ fontSize: ".8em" }} onClick={() => {
                                    handleClose();
                                    onSaveAs();
                                }} >
                                    <ListItemIcon><SaveAs fontSize='small' /></ListItemIcon>
                                    Save this recipe as...
                                </MenuItem>}
                                <MenuItem key={"LoadPromptButton"} style={{ fontSize: ".8em" }} onClick={() => {
                                    handleClose();
                                    onLoad();
                                }} >
                                    <ListItemIcon><FileOpen fontSize='small' /></ListItemIcon>
                                    Load a recipe
                                </MenuItem>
                                {!reducedOptions && <>
                                    <Divider />
                                    <MenuItem key={"GridButton"} style={{ fontSize: ".8em" }} onClick={() => {
                                        handleClose();
                                        setGridEditorState({
                                            ...prompt,
                                            prompt: prompt.positivePrompt,
                                            name: "New Grid",
                                            xValMode: "NON",
                                            xVals: [],
                                            yValMode: "NON",
                                            yVals: []
                                        } as Grid)
                                        setGridEditorOpen(true)
                                    }} >
                                        <ListItemIcon><GridView fontSize='small' /></ListItemIcon>
                                        Use for grid
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem key={"I'mFeelingLucky"} style={{ fontSize: ".8em" }} onClick={() => {
                                        handleClose();
                                        setLuckyEverOpen(true);
                                        setLuckyOpen(true)
                                    }} >
                                        <ListItemIcon><Casino fontSize='small' /></ListItemIcon>
                                        I'm Feeling Lucky
                                    </MenuItem>
                                </>}
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

        {luckyEverOpen && <RandomImageModal
            open={luckyOpen} setOpen={setLuckyOpen}
            setFilter={setFilter} filter={filter}
        />}

        <GridEditor
            grid={gridEditorState ?? {} as Grid} setGrid={setGridEditorState}
            open={gridEditorOpen} setOpen={setGridEditorOpen} loading={createLoading}
            onOk={onEditorOk}
        />
    </>

}