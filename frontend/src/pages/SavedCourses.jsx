import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Card, 
    CardContent, 
    Typography, 
    Grid, 
    Container,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import NavBar from './NavBar';
import API_BASE_URL from '../api';

function SavedCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savedCourses, setSavedCourses] = useState(new Set());
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const navigate = useNavigate();

    const fetchSavedCourses = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/saved-courses`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setCourses(data);
            setSavedCourses(new Set(data.map(course => course.id)));
        } catch (error) {
            console.error('Error fetching saved courses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            navigate('/login');
            return;
        }
        
        fetchSavedCourses();
    }, []);

    const handleSaveCourse = async (courseId) => {
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

            setOpenDialog(false);
            // Reload the courses after unsaving
            fetchSavedCourses();
        } catch (error) {
            console.error('Error updating course save status:', error);
        }
    };

    const handleUnsaveClick = (e, course) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedCourse(course);
        setOpenDialog(true);
    };

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
                                        <Button 
                                            onClick={(e) => handleUnsaveClick(e, course)}
                                            variant="contained"
                                            color="success"
                                            size="small"
                                            sx={{ mt: 2 }}
                                        >
                                            Saved
                                        </Button>

                                    </CardContent>
                                </Card>
                            </Link>
                        </Grid>
                    ))}
                    {courses.length === 0 && (
                        <Grid item xs={12}>
                            <Typography variant="h6" color="text.secondary" align="center">
                                No saved courses yet
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Container>

            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                aria-labelledby="unsave-dialog-title"
            >
                <DialogTitle id="unsave-dialog-title">
                    Confirm Unsave
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to unsave this course?
                    </Typography>
                    <Typography 
                        variant="subtitle1" 
                        sx={{ mt: 2, fontWeight: 'bold' }}
                    >
                        {selectedCourse?.title}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setOpenDialog(false)} 
                        color="primary"
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={() => handleSaveCourse(selectedCourse?.id)} 
                        color="error"
                        variant="contained"
                        autoFocus
                    >
                        Unsave
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default SavedCourses; 