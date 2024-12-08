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
import API_BASE_URL from '../api';
import LoadingOverlay from '../Effects/LoadingOverlay';

function SavedCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savedCourses, setSavedCourses] = useState(new Set());
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const navigate = useNavigate();

    const fetchSavedCourses = async () => {
        // fetch token from the browser's localStorage (Google Chrome: Application > Local Storage)
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/saved-courses`, {
            // after the user is logged in, whenever he/she wants to access user data, we need to sent this headers in this exact format
            // you cannot change this format, it's defined by the OAuth 2.0 specification (RFC 6750)
            // also, this is a javascript object with the key called "headers" and with the value being another object
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // set a constant called "data" that is the object returned from the backend
            // this data is a list of course objects with simplified information
            const data = await response.json();
            // set the react state object courses as "data" (containing course objects)
            setCourses(data);
            // create a new list with just string ids of courses, not objects!
            setSavedCourses(new Set(data.map(course => course.id)));
        } catch (error) {
            console.error('Error fetching saved courses:', error);
        } finally {
            // when done, setLoading(false) and stops the loading animation
            setLoading(false);
        }
    };

    // when the user lands on this page, it triggers use effect and triggers the function fetchSavedCourses()
    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            navigate('/login');
            return;
        }
        
        fetchSavedCourses();
    }, []);


    const unsaveCourse = async (courseId) => {
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
            // close the confirm unsave course dialogue
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


    return (
        <>
            {loading && <LoadingOverlay />}
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
                    {!loading && courses.length === 0 && (
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
                        // this onClick triggers the function unsaveCourse
                        onClick={() => unsaveCourse(selectedCourse?.id)} 
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