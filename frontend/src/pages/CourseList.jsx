import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
    Card, 
    CardContent, 
    Typography, 
    Grid, 
    Container,
    Button,
    TextField,
    Box,
    CircularProgress
} from '@mui/material';
import API_BASE_URL from '../api';
import { useNavigate } from 'react-router-dom';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LoadingOverlay from '../Effects/LoadingOverlay';

function CourseList() {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [savedCourses, setSavedCourses] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const observer = useRef();
    const navigate = useNavigate();

    // Last element callback for intersection observer
    const lastCourseElementRef = useCallback(node => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        }, { rootMargin: '100px' });
        if (node) observer.current.observe(node);
    }, [isLoading, hasMore]);

    // Modified fetch courses function
    const fetchCourses = async (pageNum) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        setIsLoading(true);
        try {
            const coursesResponse = await fetch(`${API_BASE_URL}/courses?page=${pageNum}&limit=18`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await coursesResponse.json();
            
            if (pageNum === 1) {
                setCourses(data.courses);
                setFilteredCourses(data.courses);
            } else {
                setCourses(prev => [...prev, ...data.courses]);
                setFilteredCourses(prev => [...prev, ...data.courses]);
            }
            setHasMore(data.has_more);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchCourses(1);
    }, []);

    // Load more when page changes
    useEffect(() => {
        if (page > 1) {
            fetchCourses(page);
        }
    }, [page]);

    // Handle search
    const handleSearch = async (term) => {
        if (!term) {
            setFilteredCourses(courses);
            setHasMore(true);  // Reset hasMore for normal pagination
            return;
        }
        
        setIsSearching(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/search-courses`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: term })
            });
            
            if (!response.ok) throw new Error('Failed to search courses');
            const coursesWithScores = await response.json();
            setFilteredCourses(coursesWithScores);
            setHasMore(false);  // Disable infinite scroll for search results
        } catch (error) {
            console.error('Search error:', error);
            setFilteredCourses(courses);
        } finally {
            setTimeout(() => {
                setIsSearching(false);
            }, 300);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch(searchTerm);
        }
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
        <Container sx={{ mt: 4, pb: 8 }}>
            {/* Search Input with combined loading effects */}
            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    label="Search Courses (Course Code or Keywords)"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: isSearching ? 'primary.main' : 'inherit',
                                borderWidth: isSearching ? '2px' : '1px',
                                transition: 'all 0.2s ease-in-out'
                            },
                            backgroundColor: isSearching ? 'rgba(230, 243, 255, 0.8)' : 'inherit',
                            transition: 'background-color 0.2s ease-in-out'
                        },
                        '& .MuiInputLabel-root': {
                            color: isSearching ? 'primary.main' : 'inherit',
                            transition: 'color 0.2s ease-in-out'
                        }
                    }}
                />
            </Box>

            {isSearching && <LoadingOverlay />}

            <Grid container spacing={3}>
                {filteredCourses.map((course, index) => ( 
                    <Grid 
                        item 
                        xs={12} 
                        sm={12} 
                        md={6} 
                        lg={4} 
                        key={course.id}
                        ref={index === filteredCourses.length - 1 ? lastCourseElementRef : null}
                    >
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
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button 
                                            onClick={(e) => handleSaveCourse(e, course.id)}
                                            color={savedCourses.has(course.id) ? "primary" : "inherit"}
                                            sx={{ minWidth: 'auto' }}
                                        >
                                            {savedCourses.has(course.id) 
                                                ? <BookmarkIcon /> 
                                                : <BookmarkBorderIcon />
                                            }
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Link>
                    </Grid>
                ))}
            </Grid>
            
            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            )}
        </Container>
    );
}

export default CourseList;