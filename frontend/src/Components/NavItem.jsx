import { ListItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const NavItem = ({ icon, label, path, isCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = location.pathname === path;

  const listItem = (
    <ListItem
      button
      onClick={() => navigate(path)}
      sx={{
        borderRadius: '8px',
        mb: 0.5,
        backgroundColor: isActive ? 'action.selected' : 'transparent',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          cursor: 'pointer',
          '& .MuiListItemIcon-root': {
            color: 'primary.main',
          },
          '& .MuiListItemText-primary': {
            color: 'primary.main',
          },
        },
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        px: 2,
        py: 1,
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <ListItemIcon 
        sx={{ 
          minWidth: isCollapsed ? 'auto' : 36,
          mr: isCollapsed ? 0 : 2,
          justifyContent: 'center',
          color: isActive ? 'primary.main' : 'inherit',
          transition: 'color 0.2s ease-in-out',
        }}
      >
        {icon}
      </ListItemIcon>
      {!isCollapsed && (
        <ListItemText 
          primary={label} 
          sx={{
            '& .MuiListItemText-primary': {
              color: isActive ? 'primary.main' : 'inherit',
              fontWeight: isActive ? 500 : 400,
              transition: 'color 0.2s ease-in-out',
            },
          }}
        />
      )}
    </ListItem>
  );

  return isCollapsed ? (
    <Tooltip title={label} placement="right">
      {listItem}
    </Tooltip>
  ) : (
    listItem
  );
};

export default NavItem;