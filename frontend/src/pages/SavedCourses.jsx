import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Card, 
    CardContent, 
    Typography, 
    Grid, 
    Container,
    CircularProgress
} from '@mui/material';
import NavBar from './NavBar';
import API_BASE_URL from '../api';

function SavedCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            navigate('/login');
            return;
        }
        
        const fetchSavedCourses = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/saved-courses`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                setCourses(data);
            } catch (error) {
                console.error('Error fetching saved courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSavedCourses();
    }, []);

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <>
            <NavBar title="Saved Courses" />
            <Container sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Saved Courses
                </Typography>
                <Grid container spacing={3}>
                    {courses.map((course) => (
                        <Grid item xs={12} sm={6} md={4} key={course.id}>
                            <Link to={`/courses/${course.id}`} style={{ textDecoration: 'none' }}>
                                <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 } }}>
                                    <CardContent>
                                        <Typography variant="h6" component="div">
                                            {course.title}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            Credits: {course.credits}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Link>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </>
    );
}

export default SavedCourses; 