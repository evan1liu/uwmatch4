import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
    Card, 
    CardContent, 
    TextField, 
    Button, 
    Typography, 
    Box,
    Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
    const [formData, setFormData] = useState({
        fullName: '',     // String: User's full name
        email: '',        // String: User's email address
        password: '',     // String: User's chosen password
        confirmPassword: ''// String: Password verification field
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // http://127.0.0.1:8000/register
    // Option 2: Remove /api from frontend
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;  // Stop the submission if passwords don't match
        }

        try {
            // for deploying, change this to /api/register when deploying
            // for testing locaclly, change this to http://127.0.0.1:8000/api/register
            await axios.post('/api/register', formData);
            navigate('/login');
        } catch (err) {
            if (err.response && err.response.status === 400) {
                // This specifically catches the "Username already registered" error
                setError('This email is already registered. Please login with your existing account.');
            } else if (err.response) {
                // Other server errors
                setError(err.response.data.detail || 'Registration failed. Please try again.');
            } else if (err.request) {
                // Network errors
                setError('Unable to reach the server. Please check your connection.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
            console.error('Registration error:', err);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
        }}>
            <Card sx={{ maxWidth: 400, width: '100%' }}>
                <CardContent>
                    <Typography variant="h5" align="center" gutterBottom>
                        Register
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            name="fullName"
                            margin="normal"
                            value={formData.fullName}
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
    );
}