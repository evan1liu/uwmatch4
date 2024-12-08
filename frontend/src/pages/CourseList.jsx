import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
    Card, 
    CardContent, 
    Typography, 
    Grid, 
    Container,
    Button,
    TextField,
    Box
} from '@mui/material';
import { debounce } from 'lodash';
import NavBar from './NavBar';
import API_BASE_URL from '../api';
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from '../Effects/LoadingOverlay';

function CourseList() {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [savedCourses, setSavedCourses] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Fetch initial courses data
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        
        const fetchCourses = async () => {
            try {
                const coursesResponse = await fetch(`${API_BASE_URL}/courses`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const coursesData = await coursesResponse.json();
                console.log('Sample course data:', coursesData[0]);
                setCourses(coursesData);
                setFilteredCourses(coursesData); // Initially show all courses

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

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce(async (term) => {
            if (!term) {
                setFilteredCourses(courses);
                setSearchLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('token');
                // Get embedding for search term
                const response = await fetch(`${API_BASE_URL}/get-embedding`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ text: term }),
                });
                
                if (!response.ok) throw new Error('Failed to get embedding');
                const { embedding } = await response.json();

                // Calculate dot product (since vectors are normalized, dot product = cosine similarity)
                // Helper function for dot product
                const dotProduct = (a, b) => {
                    if (!a || !b || a.length !== b.length) return 0;
                    let sum = 0;
                    for (let i = 0; i < a.length; i++) {
                        sum += a[i] * b[i];
                    }
                    return sum;
                };

                const coursesWithSimilarity = courses
                    .map(course => ({
                        ...course,
                        similarity: dotProduct(embedding, course.embedding)
                    }))
                    .sort((a, b) => b.similarity - a.similarity);

                setFilteredCourses(coursesWithSimilarity);
            } catch (error) {
                console.error('Search error:', error);
                setFilteredCourses(courses);
            } finally {
                setSearchLoading(false);
            }
        }, 500),
        [courses]
    );

    // Handle search input
    const handleSearchChange = (event) => {
        const term = event.target.value;
        setSearchTerm(term);
        setSearchLoading(true);
        debouncedSearch(term);
    };

    const handleSaveCourse = async (e, courseId) => {
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

    return (
        <>
            {loading && <LoadingOverlay />}
            <NavBar title="Courses" />
            <Container sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Courses
                </Typography>
                
                {/* Search Input */}
                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        label="Search Courses"
                        variant="outlined"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        disabled={loading}
                    />
                </Box>

                <Grid container spacing={3}>
                    {filteredCourses.map((course) => ( 
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
                                        {searchTerm && course.similarity !== undefined && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                Relevance: {(course.similarity * 100).toFixed(1)}%
                                            </Typography>
                                        )}
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