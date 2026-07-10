import * as React from "react";
import {
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    ClickAwayListener,
} from "@mui/material";
import { ChevronRight } from "@mui/icons-material";

interface MenuItemWithSubMenuProps {
    label: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    disabled?: boolean
}

//Thanks to GPT for htis component 

export const MenuItemWithSubMenu: React.FC<MenuItemWithSubMenuProps> = ({
    label,
    icon,
    children, disabled,
}) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <MenuItem onClick={handleClick} disabled={disabled}>
                {icon && <ListItemIcon>{icon}</ListItemIcon>}
                <ListItemText>{label}</ListItemText>
                <ChevronRight fontSize="small" />
            </MenuItem>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
            >
                <ClickAwayListener onClickAway={handleClose}>
                    {Boolean(anchorEl) ? <div>
                        {React.Children.map(children, (child) =>
                            React.isValidElement(child)
                                ? React.cloneElement(child as React.ReactElement<any>, {
                                    onClick: (e: any) => {
                                        // If the child already has an onClick, call it
                                        if ((child as React.ReactElement<any>).props.onClick) {
                                            (child as React.ReactElement<any>).props.onClick(e);
                                        }
                                        handleClose();
                                    },
                                })
                                : child
                        )}
                    </div> : <></>}
                </ClickAwayListener>
            </Menu>
        </>
    );
};
