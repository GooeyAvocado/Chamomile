import * as React from 'react';
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
import { Tooltip } from '@mui/material';

export default function PromptButton(props: {
    onBrew: () => void
    onSave: () => void
    onLoad: () => void
    fullWidth?: boolean
}) {

    const {onBrew,onLoad,onSave, fullWidth} = props
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLDivElement>(null);
    const {pong} = usePingPong()

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = () => {    
        setOpen(false);
    };

    return (
        <React.Fragment>
            <ButtonGroup
                variant="contained"
                ref={anchorRef}
                fullWidth = {fullWidth}
            >
                <Tooltip title={!pong?.SD ? 'Kitchen\'s closed\n(Could not contact SD)' : 'Click to start brewing images'}><Button  onClick={onBrew} disabled={!pong?.SD}>Brew</Button></Tooltip>
                <Button size="small" style={{width:'40px'}} onClick={handleToggle} >
                    <ArrowDropDownIcon />
                </Button>
            </ButtonGroup>
            <Popper sx={{ zIndex: 2 }} open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                {({ TransitionProps, placement }) => (
                    <Grow {...TransitionProps} style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom', }} >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList id="split-button-menu" >
                                    <MenuItem key={"SavePromptButton"} style={{fontSize:".8em"}} onClick={()=>{
                                        handleClose();
                                        onSave();
                                    }} >
                                        Save this recipe
                                    </MenuItem>
                                    <MenuItem key={"LoadPromptButton"} style={{fontSize:".8em"}} onClick={()=>{
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
        </React.Fragment>
    );
}