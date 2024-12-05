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
import API_BASE_URL from '../api';

export default function Register() {
    const [formData, setFormData] = useState({
        firstName: '',    // New field
        lastName: '',     // New field
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check if both passwords during register are the same
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;  // Stop the submission if passwords don't match
        }

        try {
            // Combine first and last name before sending
            const submitData = {
                fullName: `${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email,
                password: formData.password,
            };

            await axios.post(`${API_BASE_URL}/register`, submitData);
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