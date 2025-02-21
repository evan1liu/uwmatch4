import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Typography,
  Alert,
  Box,
  Button,
} from '@mui/material';
import API_BASE_URL from '../api';
import { Logout as LogoutIcon } from '@mui/icons-material';
import ConfirmLogout from '../PopoutWIndows/ConfirmLogout';
import Cookies from 'js-cookie';

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      setIsAuthenticated(true);
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserData(response.data);
        } catch (err) {
          console.error('Error:', err);
          setError('Failed to fetch user data');
          if (err.response?.status === 401) {
            Cookies.remove('token');
            setIsAuthenticated(false);
          }
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    setOpenDialog(false);
    Cookies.remove('token');
    navigate('/login');
  };

  const handleLogoutClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenDialog(true);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container sx={{ mt: 4, pb: 8 }}>
        <Typography variant="h6" color="text.secondary" align="center">
          Sign in to view your profile.
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <Container sx={{ mt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Profile Information
                </Typography>
                <Typography variant="body1" component="div">
                  <p><strong>Full Name:</strong> {userData.full_name}</p>
                  <p><strong>Email:</strong> {userData.email}</p>
                  <p><strong>Major:</strong> {userData.major}</p>
                  <p><strong>Year:</strong> {userData.year}</p>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mt: 'auto', p: 2 }}>
              <Button
                fullWidth
                startIcon={<LogoutIcon />}
                onClick={handleLogoutClick}
                color="inherit"
              >
                Logout
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
      <ConfirmLogout
        openDialog={openDialog}
        handleLogout={handleLogout}
        onClose={() => setOpenDialog(false)}
      />
    </>
  );
}