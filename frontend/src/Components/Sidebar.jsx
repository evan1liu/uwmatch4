import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  Typography, 
  Avatar,
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import { 
  School as SchoolIcon,
  BookmarkBorder as BookmarkIcon,
  Person2 as ProfileIcon,
  ViewModule as RoadmapIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavItem from './NavItem';
import uwmatchIcon from '../assets/uwmatch.png';
import API_BASE_URL from '../api';
import { SidebarContext } from '../contexts/SidebarContext';

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 65;  // Width when sidebar is collapsed

const Sidebar = () => {
  const [userData, setUserData] = useState(null);
  const { isCollapsed, setIsCollapsed } = useContext(SidebarContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = location.pathname !== '/login' && location.pathname !== '/signup';

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await axios.get(`${API_BASE_URL}/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUserData(response.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    if (isLoggedIn) {
      fetchUserData();
    }
  }, [isLoggedIn, navigate]);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (isMobile) return null;

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: 'background.default',
            borderRight: '1px solid',
            borderColor: 'divider',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            pl: isCollapsed ? 0 : 0.5,
          }}>
            {!isCollapsed && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
              </>
            )}
            {isCollapsed && (
              <img 
                src={uwmatchIcon} 
                alt="UWMatch Logo" 
                style={{ 
                  width: 40, 
                  height: 40,
                }} 
              />
            )}
          </Box>

          {isLoggedIn && (
            <Box sx={{ 
              mb: 3, 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              pl: isCollapsed ? 0 : 0.5,
            }}>
              <Avatar sx={{ width: 40, height: 40, mr: isCollapsed ? 0 : 2 }}>
                {userData?.full_name ? userData.full_name[0].toUpperCase() : 'U'}
              </Avatar>
              {!isCollapsed && (
                <Box>
                  <Typography variant="subtitle2">
                    {userData?.full_name || 'Loading...'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {userData?.email || 'Loading...'}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          <List>
            <>
              <NavItem 
                icon={<SchoolIcon />} 
                label="Courses" 
                path="/courses" 
                isCollapsed={isCollapsed}
              />
              <NavItem 
                icon={<RoadmapIcon />} 
                label="Roadmap" 
                path="/roadmap" 
                isCollapsed={isCollapsed}
              />
              <NavItem 
                icon={<BookmarkIcon />} 
                label="Saved Courses" 
                path="/saved-courses" 
                isCollapsed={isCollapsed}
              />
              <NavItem 
                icon={<ProfileIcon />} 
                label="Profile" 
                path="/profile" 
                isCollapsed={isCollapsed}
              />
            </>
          </List>
        </Box>

        {/* Collapse Toggle Button */}
        <IconButton
          onClick={handleToggleCollapse}
          sx={{
            position: 'fixed',
            left: isCollapsed ? COLLAPSED_WIDTH - 20 : DRAWER_WIDTH - 20,
            bottom: 20,
            width: 40,
            height: 40,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              bgcolor: 'action.hover',
            },
            transition: theme.transitions.create('left', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Drawer>
    </>
  );
};

export default Sidebar;