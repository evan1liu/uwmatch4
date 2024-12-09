import {
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Box,
    Link
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function LoginForm({ formData, handleChange, handleSubmit, error }) {
    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '100%',
            padding: 3 // Add some padding for mobile
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
                            <Link component={RouterLink} to="/signup">
                                Don't have an account? Sign up!
                            </Link>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
}
