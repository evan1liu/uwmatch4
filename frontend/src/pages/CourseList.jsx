import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Card, 
    CardContent, 
    Typography, 
    Grid, 
    Container,
    CircularProgress,
    Button
} from '@mui/material';
import NavBar from './NavBar';
import API_BASE_URL from '../api';
import { useNavigate } from 'react-router-dom';

function CourseList() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savedCourses, setSavedCourses] = useState(new Set());
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            navigate('/login');
            return;
        }
        
        const fetchCourses = async () => {
            try {
                // Fetch courses
                const coursesResponse = await fetch(`${API_BASE_URL}/courses`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const coursesData = await coursesResponse.json();
                setCourses(coursesData);

                // Fetch saved courses status
                const savedResponse = await fetch(`${API_BASE_URL}/saved-courses`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const savedData = await savedResponse.json();
                setSavedCourses(new Set(savedData.map(course => course.id)));
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const handleSaveCourse = async (e, courseId) => {
        // Prevent the click from bubbling up to the card link
        e.preventDefault();
        e.stopPropagation();

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/save-course/${courseId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to update course save status');
            }

            // Toggle the saved status
            setSavedCourses(prev => {
                const newSet = new Set(prev);
                if (newSet.has(courseId)) {
                    newSet.delete(courseId);
                } else {
                    newSet.add(courseId);
                }
                return newSet;
            });
        } catch (error) {
            console.error('Error updating course save status:', error);
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <>
            <NavBar title="Courses" />
            <Container sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Courses
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
                                        <Button 
                                            onClick={(e) => handleSaveCourse(e, course.id)}
                                            variant="contained"
                                            color={savedCourses.has(course.id) ? "success" : "primary"}
                                            size="small"
                                            sx={{ mt: 2 }}
                                        >
                                            {savedCourses.has(course.id) ? "Saved" : "Save Course"}
                                        </Button>
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

export default CourseList;
