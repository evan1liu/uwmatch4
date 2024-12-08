import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  List, 
  Typography, 
  Avatar,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  BookmarkBorder as BookmarkIcon,
  Login as LoginIcon,
  PersonAdd as SignupIcon,
  Logout as LogoutIcon 
} from '@mui/icons-material';
import NavItem from './NavItem';

const DRAWER_WIDTH = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isLoggedIn = location.pathname !== '/login' && location.pathname !== '/signup';

  if (isMobile) return null; // Hide sidebar on mobile

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: 'background.default',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Course Platform
        </Typography>

        {isLoggedIn && (
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ width: 40, height: 40, mr: 2 }}>U</Avatar>
            <Box>
              <Typography variant="subtitle2">Username</Typography>
              <Typography variant="caption" color="text.secondary">
                user@example.com
              </Typography>
            </Box>
          </Box>
        )}

        <List>
          {!isLoggedIn ? (
            // Login/Signup navigation items
            <>
              <NavItem icon={<LoginIcon />} label="Login" path="/login" />
              <NavItem icon={<SignupIcon />} label="Sign Up" path="/signup" />
            </>
          ) : (
            // Main navigation items
            <>
              <NavItem icon={<DashboardIcon />} label="Dashboard" path="/dashboard" />
              <NavItem icon={<SchoolIcon />} label="Courses" path="/courses" />
              <NavItem icon={<BookmarkIcon />} label="Saved Courses" path="/saved-courses" />
            </>
          )}
        </List>
        
        {isLoggedIn && (
          <Box sx={{ mt: 'auto', p: 2 }}>
            <Button
              fullWidth
              startIcon={<LogoutIcon />}
              onClick={() => navigate('/login')}
              color="inherit"
            >
              Logout
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default Sidebar;