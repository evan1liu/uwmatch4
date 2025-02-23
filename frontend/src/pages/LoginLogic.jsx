import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../api';
import Cookies from 'js-cookie';
import { TextField, Button, Typography, Box } from '@mui/material';

export default function LoginLogic() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const [isVerifying, setIsVerifying] = useState(false);  // State for loading animation

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (token) {
            setIsVerifying(true);  // Show loading animation
            Cookies.set('token', token, { expires: 30, secure: true, sameSite: 'strict' });
            const fetchUserData = async () => {
                try {
                    const response = await axios.get(`${API_BASE_URL}/profile`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!response.data.major || !response.data.year) {
                        navigate('/onboarding');  // Redirect to onboarding if incomplete
                    } else {
                        navigate('/profile');  // Redirect to profile if complete
                    }
                } catch (err) {
                    console.error('Error fetching user data:', err);
                    navigate('/login');
                } finally {
                    setIsVerifying(false);  // Hide loading animation
                }
            };
            fetchUserData();
        }
    }, [location, navigate]);

    if (isVerifying) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <img src="/path/to/uwmatch-logo.png" alt="UW Match Logo" style={{ width: '100px', marginBottom: '20px' }} />
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>Verifying...</Typography>
            </Box>
        );
    }

    // Handle token from verification redirect
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (token) {
            Cookies.set('token', token, { expires: 30, secure: true, sameSite: 'strict' });
            // Check if onboarding is needed after fetching user data
            const fetchUserData = async () => {
                try {
                    const response = await axios.get(`${API_BASE_URL}/profile`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!response.data.major || !response.data.year) {
                        navigate('/onboarding');
                    } else {
                        navigate('/profile');
                    }
                } catch (err) {
                    console.error('Error fetching user data:', err);
                    navigate('/login');
                }
            };
            fetchUserData();
        }
    }, [location, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Optional: Validate email on the frontend
        if (!email.endsWith('@wisc.edu')) {
            setMessage('Please use a wisc.edu email address.');
            return;
        }
    
        try {
            // Create form data
            const formData = new URLSearchParams();
            formData.append('email', email);
    
            // Send POST request with form data
            const response = await axios.post(`${API_BASE_URL}/request-verification`, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
    
            setMessage(response.data.message);
            setEmail(''); // Clear input after success
        } catch (err) {
            console.error('Verification request error:', err.response?.data || err);
            setMessage('Error sending verification email. Please try again.');
        }
    };

    const FRONTEND_DOMAIN = import.meta.env.DEV 
        ? 'http://127.0.0.1:3000'
        : 'https://www.uwmatch.com';

    async function requestVerification(email) {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('domain', FRONTEND_DOMAIN);

        // POST to your FastAPI route
        await axios.post(`${API_BASE_URL}/request-verification`, formData);
    }

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ maxWidth: 400, width: '100%', p: 3 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Login / Signup
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Wisc.edu Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        margin="normal"
                    />
                    <Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }}>
                        Send Verification Email
                    </Button>
                    {message && <Typography align="center" sx={{ mt: 2 }}>{message}</Typography>}
                </form>
            </Box>
        </Box>
    );
}