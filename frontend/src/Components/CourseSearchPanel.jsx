// CourseSearchPanel.jsx
import { 
    Box, 
    TextField, 
    Typography, 
    CircularProgress 
  } from '@mui/material';
  import axios from 'axios';
  import API_BASE_URL from '../api';
  import CourseCard from './CourseCard';
  import { useState } from 'react';
  
  const CourseSearchPanel = ({ 
    selectedTerm, 
    planCourses, 
    onAddCourse 
  }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
  
    const handleSearch = async (e) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      
      setLoading(true);
      try {
        const response = await axios.post(`${API_BASE_URL}/search-courses`, 
          { text: searchQuery },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
        );
        setCourses(response.data);
      } catch (error) {
        console.error('Error searching courses:', error);
      } finally {
        setLoading(false);
      }
    };
  
    const handleAddCourse = (course) => {
      onAddCourse(course);
      // Don't clear the search results after adding a course
    };
  
    return (
      <Box 
        sx={{ 
          position: 'fixed',
          width: '280px',
          right: 0,
          top: 0,
          bottom: 0,
          height: '100vh',
          display: { xs: 'none', md: 'block' },
          overflow: 'hidden',
          backgroundColor: 'background.paper',
          borderLeft: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ 
          p: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {selectedTerm && (
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2,
                color: 'primary.main',
                fontWeight: 500
              }}
            >
              Adding courses to {selectedTerm.term} {selectedTerm.year}
            </Typography>
          )}
          
          <form onSubmit={handleSearch}>
            <TextField
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              variant="outlined"
              sx={{ mb: 2 }}
              disabled={!selectedTerm}
            />
          </form>
  
          <Box 
            sx={{ 
              flexGrow: 1,
              overflowY: 'auto',
              pr: 1,
              mr: -1
            }}
          >
            {!selectedTerm ? (
              <Typography 
                variant="body1" 
                color="text.secondary"
                align="center"
                sx={{ mt: 4 }}
              >
                Select a term to add courses
              </Typography>
            ) : loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : courses.length > 0 ? (
              courses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isInPlan={Object.values(planCourses).some(
                    termCourses => termCourses?.some(c => c.id === course.id)
                  )}
                  onAdd={() => handleAddCourse(course)}
                  isDraggable={false}
                />
              ))
            ) : (
              <Typography 
                variant="body2" 
                color="text.secondary"
                align="center"
              >
                No courses found
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    );
  };
  
  export default CourseSearchPanel;
  