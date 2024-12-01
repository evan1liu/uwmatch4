import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Button, 
    Container, 
    Card, 
    CardContent,
    Grid,
    CircularProgress,
    Alert
} from '@mui/material';

export default function Dashboard() {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
    
        const fetchUserData = async () => {
            try {
                // for deploying, change this to /api/v1/profile when deploying
                const response = await axios.get('/api/v1/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setUserData(response.data);
            } catch (err) {
                console.error('Error:', err);
                setError('Failed to fetch user data');
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        };
    
        fetchUserData();
    }, [navigate]);
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };
    
    if (!userData) {
        return (
            <Container sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <CircularProgress />
            </Container>
        );
    }
    
    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Dashboard
                    </Typography>
                    <Button color="inherit" onClick={handleLogout}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>
            
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
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Statistics
                                </Typography>
                                <Typography variant="body1">
                                    Add your dashboard statistics here.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
}