import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
    Card, 
    CardContent, 
    TextField, 
    Button, 
    Typography, 
    Box,
    Link,
    CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../api';

export default function Onboarding() {
    const [formData, setFormData] = useState({
        year: '',
        major: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            setLoading(true);
            const submitData = {
                fullName: `${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email,
                password: formData.password,
            };
            await axios.post(`${API_BASE_URL}/register`, submitData);
            function delay(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            await delay(30);
            const loginData = new FormData();
            loginData.append('username', formData.email);
            loginData.append('password', formData.password);
            const response = await axios.post(`${API_BASE_URL}/token`, loginData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            localStorage.setItem('token', response.data.access_token);
            navigate('/dashboard');
        } catch (err) {
            if (err.response && err.response.status === 400) {
                setError('This email is already registered. Please login with your existing account.');
            } else if (err.response) {
                setError(err.response.data.detail || 'Registration failed. Please try again.');
            } else if (err.request) {
                setError('Unable to reach the server. Please check your connection.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <Box sx={{ position: 'relative', minHeight: '100vh' }}>
            {loading && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        bgcolor: 'rgba(0, 0, 0, 0.1)',
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <CircularProgress sx={{ color: '#fff' }} />
                </Box>
            )}
            <Box sx={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                pointerEvents: loading ? 'none' : 'auto' 
            }}>
                <Card sx={{ maxWidth: 400, width: '100%' }}>
                    <CardContent>
                        <Typography variant="h5" align="center" gutterBottom>
                            Register
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="First Name"
                                name="firstName"
                                margin="normal"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Last Name"
                                name="lastName"
                                margin="normal"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                margin="normal"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type="password"
                                margin="normal"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                margin="normal"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            {error && (
                                <Typography color="error" align="center" sx={{ mt: 1 }}>
                                    {error}
                                </Typography>
                            )}
                            <Button 
                                fullWidth 
                                variant="contained" 
                                type="submit"
                                sx={{ mt: 2 }}
                                disabled={loading}
                            >
                                Register
                            </Button>
                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <Link component={RouterLink} to="/login">
                                    Already have an account? Login
                                </Link>
                            </Box>
                        </form>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}
