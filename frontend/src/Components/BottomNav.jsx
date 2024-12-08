import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getValue = () => {
    if (location.pathname.startsWith('/dashboard')) return 'dashboard';
    if (location.pathname.startsWith('/courses')) return 'courses';
    if (location.pathname.startsWith('/saved-courses')) return 'saved-courses';
    if (location.pathname.startsWith('/login') || location.pathname.startsWith('/signup')) return '';
    return '';
  };

  const [value, setValue] = React.useState(getValue());

  React.useEffect(() => {
    setValue(getValue());
  }, [location.pathname]);

  if (!isMobile) return null;

  return (
    <Paper 
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} 
      elevation={3}
    >
      <BottomNavigation
        showLabels={false}
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          navigate(`/${newValue}`);
        }}
      >
        <BottomNavigationAction 
          label="Dashboard" 
          value="dashboard" 
          icon={<DashboardIcon />} 
        />
        <BottomNavigationAction 
          label="Courses" 
          value="courses" 
          icon={<SchoolIcon />} 
        />
        <BottomNavigationAction 
          label="Saved" 
          value="saved-courses" 
          icon={<BookmarkBorderIcon />} 
        />
        <BottomNavigationAction 
          label="Logout" 
          value="login" 
          icon={<LogoutIcon />} 
        />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;