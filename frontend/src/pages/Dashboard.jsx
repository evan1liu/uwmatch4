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
    Alert
} from '@mui/material';
import NavBar from './NavBar';
import API_BASE_URL from '../config/api';

export default function Dashboard() {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(''); // this is a string variable to display any error messages from Dashboard.jsx
    const navigate = useNavigate(); // this is a built-in react hook to navigate to different pages

    useEffect(() => { // within the curly braces is the function that will be called when the navigate state changes
        const token = localStorage.getItem('token');
        // the token is stored in the user's browser, we can use the localStorage.getItem to get the user's token
        if (!token) { // if the user doesn't have a token, redirect them to the login page
            navigate('/login');
            return;
        }
    
        const fetchUserData = async () => {
            try {
                // for deploying, change this to /api/v1/profile
                // for testing locaclly, change this to http://127.0.0.1:8000/api/v1/profile
                const response = await axios.get(`${API_BASE_URL}/profile`, {
                // the authorization header is a standard way of sending authentication credentials regardless the HTTP method
                // if the user wants to send any request (GET, POST) to view his own information, then the user needs to send this authorization header
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setUserData(response.data); // response.data is a function from Axios
            // catch is a javascript function that will run if the function in the try failed
            } catch (err) { // axios creates this err object when the request fails
                console.error('Error:', err);
                setError('Failed to fetch user data');
                if (err.response?.status === 401) {
                // when the token expires, remove the expired token and redirect the user to the login page
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        };
    
        fetchUserData();
    }, [navigate]);
    // when the navigate state changes, the function in the useEffect will run
    // when the user comes to the dashboard page from login, the navigate function is used, so this useEffect is called
    
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
            <NavBar title="Dashboard" />
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