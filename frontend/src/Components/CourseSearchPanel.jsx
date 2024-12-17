// CourseSearchPanel.jsx
import { 
    Box, 
    TextField, 
    Typography, 
    CircularProgress,
    ButtonGroup,
    Button
  } from '@mui/material';
  import SearchIcon from '@mui/icons-material/Search';
  import BookmarkIcon from '@mui/icons-material/Bookmark';
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
    const [mode, setMode] = useState('search'); // 'search' or 'saved'
  
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
  
    const fetchSavedCourses = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/saved-courses`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching saved courses:', error);
      } finally {
        setLoading(false);
      }
    };
  
    const handleModeChange = (newMode) => {
      setMode(newMode);
      setCourses([]);
      setSearchQuery('');
      if (newMode === 'saved') {
        fetchSavedCourses();
      }
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
          <ButtonGroup 
            variant="outlined" 
            fullWidth 
            sx={{ mb: 2 }}
          >
            <Button 
              startIcon={<SearchIcon />}
              onClick={() => handleModeChange('search')}
              variant={mode === 'search' ? 'contained' : 'outlined'}
            >
              Search
            </Button>
            <Button 
              startIcon={<BookmarkIcon />}
              onClick={() => handleModeChange('saved')}
              variant={mode === 'saved' ? 'contained' : 'outlined'}
            >
              Saved
            </Button>
          </ButtonGroup>
  
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
          
          {mode === 'search' && (
            <form onSubmit={handleSearch}>
              <TextField
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </form>
          )}
  
          <Box 
            sx={{ 
              flexGrow: 1,
              overflowY: 'auto',
              pr: 1,
              mr: -1
            }}
          >
            {loading ? (
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
                  onAdd={selectedTerm ? () => onAddCourse(course) : undefined}
                  isDraggable={true}
                  sourceType="panel"
                />
              ))
            ) : (
              <Typography 
                variant="body2" 
                color="text.secondary"
                align="center"
              >
                {mode === 'search' ? 'No courses found' : 'No saved courses'}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    );
  };
  
  export default CourseSearchPanel;
  