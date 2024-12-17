// Roadmap.jsx
import { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { 
  Grid, 
  Box, 
  Container,
} from '@mui/material';
import axios from 'axios';
import API_BASE_URL from '../api';
import TermColumn from '../Components/TermColumn';
import CourseSearchPanel from '../Components/CourseSearchPanel';
import ConfirmDialog from '../Components/ConfirmDialog';
import TrashZone from '../Components/TrashZone';
import { SidebarContext } from '../contexts/SidebarContext';
import ConfirmCourseMove from '../Components/ConfirmCourseMove';

function Roadmap() {
  // States for roadmap data
  const [planCourses, setPlanCourses] = useState({});
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    courseId: null,
    year: null,
    term: null
  });

  const { isCollapsed } = useContext(SidebarContext);

  // Add console.log to debug
  console.log('Sidebar collapsed:', isCollapsed);

  // Reorganize terms by academic years - corrected
  const academicYears = useMemo(() => {
    return [
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
  }, []);

  // Fetch user's roadmap data
  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/roadmap`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const roadmapData = {};
        response.data.forEach(entry => {
          const key = `${entry.year}_${entry.term}`;
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

  // Handle term selection
  const handleTermSelect = useCallback((year, term) => {
    if (selectedTerm?.year === year && selectedTerm?.term === term) {
      setSelectedTerm(null);
    } else {
      setSelectedTerm({ year, term });
    }
  }, [selectedTerm]);

  // Handle adding course to term
  const handleAddCourse = async (course) => {
    if (!selectedTerm) return;
    
    const termKey = `${selectedTerm.year}_${selectedTerm.term}`;
    if (planCourses[termKey]?.some(c => c.id === course.id)) {
      return; // Course already in term
    }

    try {
      await axios.post(`${API_BASE_URL}/roadmap/change`, {
        courseId: course.id,
        year: selectedTerm.year,
        term: selectedTerm.term
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Update local state with the full course object
      const updatedCourses = { ...planCourses };
      if (!updatedCourses[termKey]) updatedCourses[termKey] = [];
      updatedCourses[termKey].push({
        id: course.id,
        title: course.title,
        credits: course.credits,
        // Add any other course properties you need
      });
      setPlanCourses(updatedCourses);
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const handleDropCourse = async (course, destYear, destTerm) => {
    // Find the source term
    let sourceKey = null;
    for (const [key, courses] of Object.entries(planCourses)) {
      if (courses.some(c => c.id === course.id)) {
        sourceKey = key;
        break;
      }
    }

    if (!sourceKey) return;

    const destKey = `${destYear}_${destTerm}`;
    if (sourceKey === destKey) return;

    try {
      // Update to match the backend API endpoint structure
      const response = await axios.post(
        `${API_BASE_URL}/roadmap/change`, 
        null,  // no request body needed since we're using query params
        {
          params: {
            courseId: course.id,
            toYear: destYear,
            toTerm: destTerm
          },
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          }
        }
      );

      if (response.status === 200) {
        // Update local state after successful API call
        const updatedCourses = { ...planCourses };
        const [movedCourse] = updatedCourses[sourceKey].filter(c => c.id === course.id);
        updatedCourses[sourceKey] = updatedCourses[sourceKey].filter(c => c.id !== course.id);
        
        if (!updatedCourses[destKey]) {
          updatedCourses[destKey] = [];
        }
        updatedCourses[destKey].push(movedCourse);

        setPlanCourses(updatedCourses);
      }
    } catch (error) {
      console.error('Error moving course:', error);
      // You might want to add some user feedback here
    }
  };

  // Handle course deletion
  const handleDeleteCourse = async (course) => {
    try {
      // Find which term the course is in using our existing helper
      const existingTerm = findExistingCourseTerm(course.id);
      
      if (!existingTerm) return; // Course not found in roadmap

      await axios.post(`${API_BASE_URL}/roadmap/change`, {
        courseId: course.id,
        fromYear: parseInt(existingTerm.year),
        fromTerm: existingTerm.term,
        toYear: null,
        toTerm: null,
        toTrash: true
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Update local state
      const updatedCourses = { ...planCourses };
      const termKey = `${existingTerm.year}_${existingTerm.term}`;
      updatedCourses[termKey] = updatedCourses[termKey].filter(
        c => c.id !== course.id
      );
      setPlanCourses(updatedCourses);
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const [moveDialog, setMoveDialog] = useState({
    open: false,
    course: null,
    existingTerm: null,
    existingYear: null,
    targetTerm: null,
    targetYear: null
  });

  // Find existing course term using frontend data
  const findExistingCourseTerm = (courseId) => {
    for (const [key, courses] of Object.entries(planCourses)) {
      if (courses?.some(c => c.id === courseId)) {
        const [year, term] = key.split('_');
        return { year: parseInt(year), term };
      }
    }
    return null;
  };

  const handleCourseChange = async (course, toYear, toTerm, fromYear = null, fromTerm = null) => {
    try {
      console.log('Course change:', { course, toYear, toTerm, fromYear, fromTerm }); // Debug log
      
      const response = await axios.post(`${API_BASE_URL}/roadmap/change`, {
        courseId: course.id,
        toYear: parseInt(toYear),
        toTerm: toTerm,
        fromYear: fromYear ? parseInt(fromYear) : null,
        fromTerm: fromTerm
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Update local state
      const updatedCourses = { ...planCourses };
      
      // Remove from old term if it exists
      if (fromYear && fromTerm) {
        const fromKey = `${fromYear}_${fromTerm}`;
        updatedCourses[fromKey] = updatedCourses[fromKey].filter(c => c.id !== course.id);
      }

      // Add to new term
      const toKey = `${toYear}_${toTerm}`;
      if (!updatedCourses[toKey]) updatedCourses[toKey] = [];
      updatedCourses[toKey].push(course);

      setPlanCourses(updatedCourses);
    } catch (error) {
      console.error('Error updating roadmap:', error);
    }
  };

  // Handle drop on term
  const handleDrop = async (course, year, term, sourceType) => {
    console.log('Roadmap handleDrop:', { course, year, term, sourceType });
    
    try {
      const existingTerm = findExistingCourseTerm(course.id);
      console.log('Existing term:', existingTerm);

      // If dragging from panel and course exists in roadmap
      if (sourceType === 'panel' && existingTerm) {
        setMoveDialog({
          open: true,
          course,
          existingTerm: existingTerm.term,
          existingYear: existingTerm.year,
          targetTerm: term,
          targetYear: year
        });
        return;
      }

      // Either moving between terms or adding new course
      await handleCourseChange(
        course,
        year,
        term,
        existingTerm?.year,
        existingTerm?.term
      );
    } catch (error) {
      console.error('Error in handleDrop:', error);
    }
  };

  return (
    <>
      <TrashZone 
        isDragging={isDragging}
        onDelete={handleDeleteCourse}
        isCollapsed={isCollapsed}
      />
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={9}>
            <Box sx={{ overflowX: 'auto' }}>
              {academicYears.map((academicYear) => (
                <Box 
                  key={academicYear.year}
                  sx={{ 
                    display: 'flex', 
                    flexWrap: 'nowrap',
                    mb: 3
                  }}
                >
                  {academicYear.terms.map(({ year, term }) => (
                    <TermColumn
                      key={`${year}_${term}`}
                      year={year}
                      term={term}
                      courses={planCourses[`${year}_${term}`] || []}
                      isSelected={selectedTerm?.year === year && selectedTerm?.term === term}
                      onTermSelect={handleTermSelect}
                      onRemoveCourse={(courseId) => setConfirmDialog({
                        open: true,
                        courseId,
                        year,
                        term
                      })}
                      onDropCourse={handleDropCourse}
                    />
                  ))}
                </Box>
              ))}
            </Box>
          </Grid>
          <Grid item md={3}>
            <CourseSearchPanel
              selectedTerm={selectedTerm}
              planCourses={planCourses}
              onAddCourse={(course) => {
                const existingTerm = findExistingCourseTerm(course.id);
                if (existingTerm) {
                  setMoveDialog({
                    open: true,
                    course,
                    existingTerm: existingTerm.term,
                    existingYear: existingTerm.year,
                    targetTerm: selectedTerm.term,
                    targetYear: selectedTerm.year
                  });
                } else {
                  handleCourseChange(course, selectedTerm.year, selectedTerm.term);
                }
              }}
            />
          </Grid>
        </Grid>
      </Box>

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={async () => {
          try {
            await axios.post(`${API_BASE_URL}/roadmap/change`, {
              courseId: confirmDialog.courseId,
              year: confirmDialog.year,
              term: confirmDialog.term
            }, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            // Use underscore here to match the droppableId format
            const termKey = `${confirmDialog.year}_${confirmDialog.term}`;
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
      <ConfirmCourseMove
        open={moveDialog.open}
        onClose={() => setMoveDialog({ ...moveDialog, open: false })}
        onConfirm={() => {
          const { course, targetYear, targetTerm, existingYear, existingTerm } = moveDialog;
          handleCourseChange(course, targetYear, targetTerm, existingYear, existingTerm);
          setMoveDialog({ ...moveDialog, open: false });
        }}
        course={moveDialog.course}
        existingTerm={moveDialog.existingTerm}
        existingYear={moveDialog.existingYear}
      />
    </Container>
    </>
  );
}

export default Roadmap;
