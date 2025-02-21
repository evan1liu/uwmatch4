// frontend/src/pages/CourseList.jsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Container,
  Button,
  TextField,
  Box,
  CircularProgress,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query'; // Add this
import API_BASE_URL from '../api';
import { useNavigate } from 'react-router-dom';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import Cookies from 'js-cookie';

function CourseList() {
  const [savedCourses, setSavedCourses] = useState(new Set());
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTermFromUrl = searchParams.get('search') || '';
  const [inputValue, setInputValue] = useState(searchTermFromUrl);

  // Sync input field with URL search term
  useEffect(() => {
    setInputValue(searchTermFromUrl);
  }, [searchTermFromUrl]);

  // Fetch default course list
  const fetchCourses = async (pageNum) => {
    const token = Cookies.get('token');
    const response = await fetch(`${API_BASE_URL}/courses?page=${pageNum}&limit=18`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch courses');
    return response.json();
  };

  // Fetch search results
  const searchCourses = async (term) => {
    const token = Cookies.get('token');
    const response = await fetch(`${API_BASE_URL}/search-courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ text: term }),
    });
    if (!response.ok) throw new Error('Failed to search courses');
    return response.json();
  };

  // Fetch default courses with React Query
  const { data: coursesData, isLoading: isCoursesLoading } = useQuery({
    queryKey: ['courses', page], // Unique key for caching
    queryFn: () => fetchCourses(page),
    keepPreviousData: true, // Keep old data while fetching new
    enabled: !searchTermFromUrl, // Only fetch if no search term
  });

  // Fetch search results with React Query
  const { data: searchData, isLoading: isSearchLoading } = useQuery({
    queryKey: ['search', searchTermFromUrl], // Unique key for caching
    queryFn: () => searchCourses(searchTermFromUrl),
    enabled: !!searchTermFromUrl, // Only fetch if there’s a search term
  });

  // Decide which data to show
  const displayCourses = searchTermFromUrl ? searchData : coursesData?.courses;
  const hasMore = searchTermFromUrl ? false : coursesData?.has_more;
  const isLoading = isCoursesLoading || isSearchLoading;

  // Handle search submission
  const handleSubmitSearch = () => {
    if (inputValue) {
      setSearchParams({ search: inputValue });
    } else {
      setSearchParams({});
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSubmitSearch();
    }
  };

  // Handle saving a course (unchanged)
  const handleSaveCourse = async (e, courseId) => {
    e.preventDefault();
    e.stopPropagation();
    const token = Cookies.get('token');
    if (!token) {
      Cookies.set('pendingAction', JSON.stringify({ type: 'saveCourse', courseId }), { expires: 1 });
      navigate('/login');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/save-course/${courseId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to update course save status');
      setSavedCourses((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(courseId)) newSet.delete(courseId);
        else newSet.add(courseId);
        return newSet;
      });
    } catch (error) {
      console.error('Error updating course save status:', error);
    }
  };

  return (
    <Container sx={{ mt: 4, pb: 8 }}>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Search Courses (Course Code or Keywords)"
          variant="outlined"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      <Grid container spacing={3}>
        {displayCourses?.map((course) => (
          <Grid item xs={12} sm={12} md={6} lg={4} key={course.id}>
            <Link to={`/courses/${course.id}`} style={{ textDecoration: 'none' }}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 } }}>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {course.title}
                  </Typography>
                  <Typography color="text.secondary">
                    Credits: {course.credits}
                  </Typography>
                  {searchTermFromUrl && course.similarity !== undefined && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Relevance: {(course.similarity * 100).toFixed(1)}%
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      onClick={(e) => handleSaveCourse(e, course.id)}
                      color={savedCourses.has(course.id) ? 'primary' : 'inherit'}
                      sx={{ minWidth: 'auto' }}
                    >
                      {savedCourses.has(course.id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default CourseList;