import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Container,
  Button,
  Box,
} from '@mui/material';
import API_BASE_URL from '../api';
import LoadingOverlay from '../Effects/LoadingOverlay';
import ConfirmUnsave from '../PopoutWIndows/ConfirmUnsave';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import Cookies from 'js-cookie';

function SavedCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [savedCourses, setSavedCourses] = useState(new Set());
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      setIsAuthenticated(true);
      const fetchSavedCourses = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/saved-courses`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error('Failed to fetch saved courses');
          const data = await response.json();
          setCourses(data);
          setSavedCourses(new Set(data.map((course) => course.id)));
        } catch (error) {
          console.error('Error fetching saved courses:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchSavedCourses();
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  const unsaveCourse = async (courseId) => {
    const token = Cookies.get('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/save-course/${courseId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to unsave course');
      setOpenDialog(false);
      setCourses(courses.filter((course) => course.id !== courseId));
      setSavedCourses((prev) => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    } catch (error) {
      console.error('Error unsaving course:', error);
    }
  };

  const handleUnsaveClick = (e, course) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCourse(course);
    setOpenDialog(true);
  };

  if (loading) return <LoadingOverlay />;

  if (!isAuthenticated) {
    return (
      <Container sx={{ mt: 4, pb: 8 }}>
        <Typography variant="h6" color="text.secondary" align="center">
          Sign in to view your saved courses.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, pb: 8 }}>
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
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      onClick={(e) => handleUnsaveClick(e, course)}
                      color="primary"
                      sx={{ minWidth: 'auto' }}
                    >
                      <BookmarkIcon />
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
        {courses.length === 0 && (
          <Grid item xs={12}>
            <Typography variant="h6" color="text.secondary" align="center">
              No saved courses yet.
            </Typography>
          </Grid>
        )}
      </Grid>

      <ConfirmUnsave
        openDialog={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={() => unsaveCourse(selectedCourse?.id)}
        courseTitle={selectedCourse?.title}
      />
    </Container>
  );
}

export default SavedCourses;