import React from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  Typography, 
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  School as SchoolIcon,
  BookmarkBorder as BookmarkIcon,
  Person2 as ProfileIcon,
  ViewModule as RoadmapIcon
} from '@mui/icons-material';
import NavItem from './NavItem';
import uwmatchIcon from '../assets/uwmatch_icon.svg';

const DRAWER_WIDTH = 240;

const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isLoggedIn = location.pathname !== '/login' && location.pathname !== '/signup';

  if (isMobile) return null; // Hide sidebar on mobile

  return (
    <>
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <img 
              src={uwmatchIcon} 
              alt="UWMatch Logo" 
              style={{ 
                width: 40, 
                height: 40, 
                marginRight: '12px' 
              }} 
            />
            <Typography variant="h5">
              UW Match
            </Typography>
          </Box>

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
              <>
                <NavItem icon={<SchoolIcon />} label="Courses" path="/courses" />
                <NavItem icon={<RoadmapIcon />} label="Roadmap" path="roadmap" />
                <NavItem icon={<BookmarkIcon />} label="Saved Courses" path="/saved-courses" />
                <NavItem icon={<ProfileIcon />} label="Profile" path="/profile" />
              </>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Sidebar;