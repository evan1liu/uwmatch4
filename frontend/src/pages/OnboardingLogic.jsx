import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../api';
import Cookies from 'js-cookie';
import { TextField, Button, Typography, Box, Autocomplete } from '@mui/material';
import { majors, years } from '../Data/MajorsAndYears';


export default function OnboardingLogic() {
    const [formData, setFormData] = useState({
        fullName: '',
        major: '',
        year: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const token = Cookies.get('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                `${API_BASE_URL}/onboarding`,
                { major: formData.major, year: formData.year, full_name: formData.fullName},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            navigate('/profile');
        } catch (err) {
            setError('Failed to save onboarding data. Please try again.');
            console.error('Onboarding error:', err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMajorChange = (event, newValue) => {
        setFormData({ ...formData, major: newValue });
    };

    const handleYearChange = (event, newValue) => {
        setFormData({ ...formData, year: newValue });
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ maxWidth: 400, width: '100%', p: 3 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Complete Your Profile
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Full Name"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        margin="normal"
                    />
                    <Autocomplete
                        fullWidth
                        options={majors}
                        value={formData.major}
                        onChange={handleMajorChange}
                        renderInput={(params) => <TextField {...params} label="Major" required />}
                        margin="normal"
                    />
                    <Autocomplete
                        fullWidth
                        options={years}
                        value={formData.year}
                        onChange={handleYearChange}
                        renderInput={(params) => <TextField {...params} label="Year" required />}
                        margin="normal"
                    />
                    {error && <Typography color="error" align="center" sx={{ mt: 2 }}>{error}</Typography>}
                    <Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }}>
                        Submit
                    </Button>
                </form>
            </Box>
        </Box>
    );
}