import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Divider, ListItemIcon } from '@mui/material';

export class ContextMenuOption {
    text?: React.ReactNode = "";
    customContent?:(onClose:()=>void) => React.ReactNode
    disabled?:boolean
    onClick?: () => void = ()=>{};
    type?: "item"|"divider"|"custom" = "item"
    icon?: React.ReactNode;
}


export default function ContextMenu(props:{
    children:React.ReactNode
    options: ContextMenuOption[]
    style?: React.CSSProperties
}) {
  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null,
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  return (
    <div onContextMenu={handleContextMenu} style={{ ...props.style, cursor: 'context-menu' }}>
      {props.children}
      
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {props.options.filter(a=>!!a).map(a=> a.type==="custom"? a.customContent?.(handleClose) : a.type==="divider" ? <Divider/> :
            <MenuItem disabled={a.disabled} onClick={()=>{
                handleClose();
                a.onClick?.();
            }}>
                {a.icon && <ListItemIcon>{a.icon}</ListItemIcon>} 
                {a.text}
            </MenuItem>
        )}
      </Menu>
    </div>
  );
}
