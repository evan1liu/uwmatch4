import { 
    ListItem, 
    ListItemButton, 
    ListItemIcon, 
    ListItemText,
    styled
  } from '@mui/material';
  import { useLocation, useNavigate } from 'react-router-dom';
  
  const StyledListItemButton = styled(ListItemButton)(({ theme, active }) => ({
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(0.5),
    '&.Mui-selected': {
      backgroundColor: theme.palette.action.selected,
      '&:hover': {
        backgroundColor: theme.palette.action.selected,
      },
    },
  }));
  
  const NavItem = ({ icon, label, path }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = location.pathname === path;
  
    return (
      <ListItem disablePadding sx={{ mb: 1 }}>
        <StyledListItemButton
          selected={isActive}
          onClick={() => navigate(path)}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            {icon}
          </ListItemIcon>
          <ListItemText primary={label} />
        </StyledListItemButton>
      </ListItem>
    );
  };
  
  export default NavItem;