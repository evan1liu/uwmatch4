import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NavBar({ title }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {title}
                </Typography>
                <Button color="inherit" onClick={() => navigate('/dashboard')}>
                    Dashboard
                </Button>
                <Button color="inherit" onClick={() => navigate('/courses')}>
                    Courses
                </Button>
                <Button color="inherit" onClick={() => navigate('/saved-courses')}>
                    Saved Courses
                </Button>
                <Button color="inherit" onClick={handleLogout}>
                    Logout
                </Button>
            </Toolbar>
        </AppBar>
    );
}
