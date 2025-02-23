import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  Box,
  Typography,
  Avatar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  IconButton,
  Button,
} from '@mui/material';
import {
  School as SchoolIcon,
  BookmarkBorder as BookmarkIcon,
  PersonOutline as ProfileIcon,
  ViewModule as RoadmapIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { SidebarContext } from '../contexts/SidebarContext';
import axios from 'axios';
import API_BASE_URL from '../api';
import uwmatchIcon from '../assets/uwmatch.png';
import Cookies from 'js-cookie';

export default function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useContext(SidebarContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      setIsLoggedIn(true);
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserData(response.data);
        } catch (error) {
          console.error('Error fetching user data:', error);
          Cookies.remove('token');
          setIsLoggedIn(false);
        }
      };
      fetchUserData();
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const NavItem = ({ icon, label, path }) => (
    <ListItemButton
      onClick={() => navigate(path)}
      sx={{ borderRadius: '8px', mb: 0.5 }}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      {!isCollapsed && <ListItemText primary={label} />}
    </ListItemButton>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isCollapsed ? 80 : 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isCollapsed ? 80 : 240,
          boxSizing: 'border-box',
          transition: 'width 0.3s',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* Branding */}
        <Box sx={{ mb: 3 }}>
          {!isCollapsed && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={uwmatchIcon}
                alt="UWMatch Logo"
                style={{ width: 40, height: 40, marginRight: '12px' }}
              />
              <Typography variant="h5">UW Match</Typography>
            </Box>
          )}
          {isCollapsed && (
            <img
              src={uwmatchIcon}
              alt="UWMatch Logo"
              style={{ width: 40, height: 40 }}
            />
          )}
        </Box>

        {/* Profile Info for Authenticated Users */}
        {isLoggedIn && (
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              pl: isCollapsed ? 0 : 0.5,
              justifyContent: isCollapsed ? 'center' : 'flex-start',
            }}
          >
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

        {/* Navigation List */}
        <List>
          <NavItem
            icon={<SchoolIcon />}
            label="Courses"
            path="/courses"
          />
          <NavItem
            icon={<BookmarkIcon />}
            label="Saved"
            path="/saved-courses"
          />
          <NavItem
            icon={<RoadmapIcon />}
            label="Roadmap"
            path="/roadmap"
          />
          <NavItem
            icon={<ProfileIcon />}
            label="Profile"
            path="/profile"
          />

          {/* Login and Sign Up for Unauthenticated Users */}
          {!isLoggedIn && (
          <>
            <ListItemButton
              onClick={() => navigate('/login')}
              sx={{
                '&:hover': {
                  border: '2px solid #1976d2', // Deeper blue border on hover
                },
                borderRadius: '8px',
                mb: 0.5,
                pl: 9
              }}
            >
              {!isCollapsed && <ListItemText primary="Login" sx={{ color: '#1565c0' }} />}
            </ListItemButton>
          </>
        )}
        </List>
      </Box>
    </Drawer>
  );
}