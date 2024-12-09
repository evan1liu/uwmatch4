import React from 'react';
import { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Button, Typography, Paper, Dialog, DialogTitle, DialogContent, DialogActions} from '@mui/material';
import { 
  School as SchoolIcon,
  BookmarkBorder as BookmarkIcon,
  Logout as LogoutIcon,
  Person2 as ProfileIcon,
  ViewModule as RoadmapIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openDialog, setOpenDialog] = useState(false);

  const getValue = () => {
    if (location.pathname.startsWith('/profile')) return 'profile';
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

  const handleLogout = () => {
    setOpenDialog(false);
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleLogoutClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenDialog(true);
  };

  return (
    <>
      <Paper 
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} 
        elevation={3}
      >
        <BottomNavigation
          showLabels={false}
          value={value}
          onChange={(event, newValue) => {
            if (newValue !== 'login') {
              setValue(newValue);
              navigate(`/${newValue}`);
            }
          }}
        >
          <BottomNavigationAction 
            label="Courses" 
            value="courses" 
            icon={<SchoolIcon />} 
          />
          <BottomNavigationAction 
            label="Roadmap" 
            value="roadmap" 
            icon={<RoadmapIcon />} 
          />
          <BottomNavigationAction 
            label="Saved" 
            value="saved-courses" 
            icon={<BookmarkIcon />} 
          />
          <BottomNavigationAction 
            label="Profile" 
            value="profile" 
            icon={<ProfileIcon />} 
          />
        </BottomNavigation>
      </Paper>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="logout-dialog-title"
      >
        <DialogTitle id="logout-dialog-title">
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to log out?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)} 
            color="primary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLogout} 
            color="error"
            variant="contained"
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BottomNav;