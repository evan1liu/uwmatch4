import { useState, useEffect } from 'react'; // React hooks for managing state (variables), when state changes, take certain actions with useEffect
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card, // define a card
    CardContent, // define content inside a card
    Typography, // text styles
    Container, // for centering content horizontally
    CircularProgress, // for loading spinner
    Box
} from '@mui/material';
import API_BASE_URL from '../api'; // fetches the base URL
import LoadingOverlay from '../Effects/LoadingOverlay';

function CourseDetail() {
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (!token) { // if the user doesn't have a token, redirect them to the login page
            navigate('/login');
            return;
        }
        
        const fetchCourse = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Course not found');
                }
                const data = await response.json();
                setCourse(data);
            } catch (error) {
                console.error('Error fetching course:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [id]);


    if (!course) {
        return <Typography>Course not found</Typography>;
    }

    return (
        <>
            {loading && <LoadingOverlay />}
            <Card>
                <CardContent>
                    <Typography variant="h4" gutterBottom>
                        {course.title}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Credits: {course.credits}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6">Description</Typography>
                        <Typography paragraph>{course.description}</Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6">Course Designation</Typography>
                        <Typography paragraph>{course.course_designation}</Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6">Last Taught</Typography>
                        <Typography paragraph>{course.last_taught}</Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6">Learning Outcomes</Typography>
                        <Typography paragraph>{course.learning_outcomes}</Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6">Prerequisites</Typography>
                        <Typography paragraph>{course.requisites}</Typography>
                    </Box>
                </CardContent>
            </Card>
        </>
    );
}

export default CourseDetail;
