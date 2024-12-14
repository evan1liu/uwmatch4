import { useState, useEffect } from 'react';
import { 
  Grid, 
  Box, 
  Container,
  TextField,
  CircularProgress,
  Typography,
} from '@mui/material';
import { DragDropContext } from 'react-beautiful-dnd';
import axios from 'axios';
import API_BASE_URL from '../api';
import TermColumn from '../Components/TermColumn';
import CourseCard from '../Components/CourseCard';
import ConfirmDialog from '../Components/ConfirmDialog';

function Roadmap() {
  // States for roadmap data
  const [planCourses, setPlanCourses] = useState({});
  const [selectedTerm, setSelectedTerm] = useState(null);
  
  // States for right panel
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    courseId: null,
    year: null,
    term: null
  });

  // Reorganize terms by academic years - corrected
  const academicYears = [
    {
      year: 2024, // Academic year 2024-2025
      terms: [
        { term: 'Fall', year: 2024 },
        { term: 'Spring', year: 2025 },
        { term: 'Summer', year: 2025 }
      ]
    },
    {
      year: 2025, // Academic year 2025-2026
      terms: [
        { term: 'Fall', year: 2025 },
        { term: 'Spring', year: 2026 },
        { term: 'Summer', year: 2026 }
      ]
    },
    {
      year: 2026, // Academic year 2026-2027
      terms: [
        { term: 'Fall', year: 2026 },
        { term: 'Spring', year: 2027 },
        { term: 'Summer', year: 2027 }
      ]
    },
    {
      year: 2027, // Academic year 2027-2028
      terms: [
        { term: 'Fall', year: 2027 },
        { term: 'Spring', year: 2028 },
        { term: 'Summer', year: 2028 }
      ]
    }
  ];

  // Fetch user's roadmap data
  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/roadmap`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const roadmapData = {};
        response.data.forEach(entry => {
          const key = `${entry.year}-${entry.term}`;
          if (!roadmapData[key]) roadmapData[key] = [];
          roadmapData[key].push(entry);
        });
        setPlanCourses(roadmapData);
      } catch (error) {
        console.error('Error fetching roadmap:', error);
      }
    };
    fetchRoadmap();
  }, []);

  // Handle course search
  const handleSearch = async (e) => {
    e.preventDefault();
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

  // Handle term selection
  const handleTermSelect = (year, term) => {
    if (selectedTerm?.year === year && selectedTerm?.term === term) {
      setSelectedTerm(null);
    } else {
      setSelectedTerm({ year, term });
    }
  };

  // Handle adding course to term
  const handleAddCourse = async (courseId) => {
    if (!selectedTerm) return;
    
    const termKey = `${selectedTerm.year}-${selectedTerm.term}`;
    if (planCourses[termKey]?.some(course => course.id === courseId)) {
      return; // Course already in term
    }

    try {
      await axios.post(`${API_BASE_URL}/roadmap/add`, {
        courseId,
        year: selectedTerm.year,
        term: selectedTerm.term
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Update local state
      const updatedCourses = { ...planCourses };
      if (!updatedCourses[termKey]) updatedCourses[termKey] = [];
      updatedCourses[termKey].push(courses.find(c => c.id === courseId));
      setPlanCourses(updatedCourses);
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  // Handle drag and drop
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const sourceKey = result.source.droppableId;
    const destKey = result.destination.droppableId;
    
    const [sourceYear, sourceTerm] = sourceKey.split('-');
    const [destYear, destTerm] = destKey.split('-');

    const updatedCourses = { ...planCourses };
    const [movedCourse] = updatedCourses[sourceKey].splice(result.source.index, 1);
    
    if (!updatedCourses[destKey]) updatedCourses[destKey] = [];
    updatedCourses[destKey].splice(result.destination.index, 0, movedCourse);

    setPlanCourses(updatedCourses);

    try {
      await axios.put(`${API_BASE_URL}/roadmap/move`, {
        courseId: movedCourse.id,
        fromYear: sourceYear,
        fromTerm: sourceTerm,
        toYear: destYear,
        toTerm: destTerm
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (error) {
      console.error('Error moving course:', error);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container spacing={2}>
          {/* Left side - Roadmap */}
          <Grid item xs={12} md={9}>
            <Box sx={{ overflowX: 'auto' }}>
              {academicYears.map((academicYear, yearIndex) => (
                <Box 
                  key={academicYear.year}
                  sx={{ 
                    display: 'flex', 
                    flexWrap: 'nowrap',
                    mb: 3 // Add margin between years
                  }}
                >
                  {academicYear.terms.map(({ year, term }) => (
                    <TermColumn
                      key={`${year}-${term}`}
                      year={year}
                      term={term}
                      courses={planCourses[`${year}-${term}`] || []}
                      isSelected={selectedTerm?.year === year && selectedTerm?.term === term}
                      onTermSelect={handleTermSelect}
                      onRemoveCourse={(courseId) => setConfirmDialog({
                        open: true,
                        courseId,
                        year,
                        term
                      })}
                    />
                  ))}
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Right side - Course Search */}
          <Grid item md={3}>
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
                        onAdd={handleAddCourse}
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
          </Grid>
        </Grid>
      </DragDropContext>

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={async () => {
          try {
            await axios.delete(`${API_BASE_URL}/roadmap/remove`, {
              data: {
                courseId: confirmDialog.courseId,
                year: confirmDialog.year,
                term: confirmDialog.term
              },
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            
            const termKey = `${confirmDialog.year}-${confirmDialog.term}`;
            const updatedCourses = { ...planCourses };
            updatedCourses[termKey] = updatedCourses[termKey].filter(
              course => course.id !== confirmDialog.courseId
            );
            setPlanCourses(updatedCourses);
          } catch (error) {
            console.error('Error removing course:', error);
          } finally {
            setConfirmDialog({ ...confirmDialog, open: false });
          }
        }}
        title="Remove Course"
        content="Are you sure you want to remove this course from your roadmap?"
      />
    </Container>
  );
}

export default Roadmap;
