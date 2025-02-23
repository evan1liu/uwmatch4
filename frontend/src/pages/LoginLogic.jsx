import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../api';
import Cookies from 'js-cookie';
import { TextField, Button, Typography, Box, CircularProgress } from '@mui/material';

export default function LoginLogic() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token'); // THIS TOKEN IS THE "LOGGED IN TOKEN"!
                                           // NOT THE VERIFICATION TOKEN!!!
        
        // added for local testing
        // if the app is in development, then isSecure = false
        // if the app is in production mode, then isSecure = true                                   
        const isSecure = import.meta.env.DEV 
        ? false  // Development
        : true;                       // Production
                                       
        if (token) {
            Cookies.set('token', token, { expires: 30, secure: isSecure, sameSite: 'strict' });
            const fetchUserData = async () => {
                try {
                    const response = await axios.get(`${API_BASE_URL}/profile`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!response.data.major || !response.data.year) {
                        navigate('/onboarding'); // Redirect to onboarding if incomplete
                    } else {
                        navigate('/profile'); // Redirect to profile if complete
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
        
        if (!email.endsWith('@wisc.edu')) {
            setMessage('Please use a wisc.edu email address.');
            return;
        }
    
        try {
            const formData = new URLSearchParams();
            formData.append('email', email);
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