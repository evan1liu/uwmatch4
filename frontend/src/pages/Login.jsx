import { useState } from 'react';
import axios from 'axios';
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
import API_BASE_URL from '../api';

export default function Login() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
  
    const handleSubmit = async (e) => {
        e.preventDefault();
        const loginData = new FormData();
        loginData.append('username', formData.username);
        loginData.append('password', formData.password);

        try { 
            const response = await axios.post(`${API_BASE_URL}/token`, loginData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            localStorage.setItem('token', response.data.access_token);
            navigate('/dashboard');
        }
        catch (err) {
            console.error('Login error:', err);
            setError(`Invalid username or password
                     (Haven't registered yet? Register now!)`);
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
                        Login
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="username"
                            type="email"
                            margin="normal"
                            value={formData.username}
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
                        {error && (
                            <Typography 
                                color="error" 
                                align="center" 
                                sx={{ mt: 1, whiteSpace: 'pre-line' }}
                            >
                                {error}
                            </Typography>
                        )}
                        <Button 
                            fullWidth 
                            variant="contained" 
                            type="submit"
                            sx={{ mt: 2 }}
                        >
                            Login
                        </Button>
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Link component={RouterLink} to="/register">
                                Don't have an account? Register
                            </Link>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
}