import { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { Grid, Box, Container, Typography } from '@mui/material';
import axios from 'axios';
import API_BASE_URL from '../api';
import TermColumn from '../Components/TermColumn';
import CourseSearchPanel from '../Components/CourseSearchPanel';
import ConfirmDialog from '../Components/ConfirmDialog';
import TrashZone from '../Components/TrashZone';
import { SidebarContext } from '../contexts/SidebarContext';
import ConfirmCourseMove from '../Components/ConfirmCourseMove';

function Roadmap() {
  const [planCourses, setPlanCourses] = useState({});
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isCollapsed } = useContext(SidebarContext);

  const confirmDialogInitial = { open: false, courseId: null, year: null, term: null };
  const [confirmDialog, setConfirmDialog] = useState(confirmDialogInitial);

  const academicYears = useMemo(
    () => [
      {
        year: 2024,
        terms: [
          { term: 'Fall', year: 2024 },
          { term: 'Spring', year: 2025 },
          { term: 'Summer', year: 2025 },
        ],
      },
      {
        year: 2025,
        terms: [
          { term: 'Fall', year: 2025 },
          { term: 'Spring', year: 2026 },
          { term: 'Summer', year: 2026 },
        ],
      },
      {
        year: 2026,
        terms: [
          { term: 'Fall', year: 2026 },
          { term: 'Spring', year: 2027 },
          { term: 'Summer', year: 2027 },
        ],
      },
      {
        year: 2027,
        terms: [
          { term: 'Fall', year: 2027 },
          { term: 'Spring', year: 2028 },
          { term: 'Summer', year: 2028 },
        ],
      },
    ],
    []
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const fetchRoadmap = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/roadmap`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const roadmapData = {};
          response.data.forEach((entry) => {
            const key = `${entry.year}_${entry.term}`;
            if (!roadmapData[key]) roadmapData[key] = [];
            roadmapData[key].push(entry);
          });
          setPlanCourses(roadmapData);
        } catch (error) {
          console.error('Error fetching roadmap:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchRoadmap();
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  const handleTermSelect = useCallback(
    (year, term) => {
      if (selectedTerm?.year === year && selectedTerm?.term === term) {
        setSelectedTerm(null);
      } else {
        setSelectedTerm({ year, term });
      }
    },
    [selectedTerm]
  );

  const handleAddCourse = async (course) => {
    if (!isAuthenticated || !selectedTerm) return;

    const termKey = `${selectedTerm.year}_${selectedTerm.term}`;
    if (planCourses[termKey]?.some((c) => c.id === course.id)) return;

    try {
      await axios.post(
        `${API_BASE_URL}/roadmap/change`,
        {
          courseId: course.id,
          year: selectedTerm.year,
          term: selectedTerm.term,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const updatedCourses = { ...planCourses };
      if (!updatedCourses[termKey]) updatedCourses[termKey] = [];
      updatedCourses[termKey].push({
        id: course.id,
        title: course.title,
        credits: course.credits,
      });
      setPlanCourses(updatedCourses);
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const findExistingCourseTerm = (courseId) => {
    for (const [key, courses] of Object.entries(planCourses)) {
      if (courses?.some((c) => c.id === courseId)) {
        const [year, term] = key.split('_');
        return { year: parseInt(year), term };
      }
    }
    return null;
  };

  const handleCourseChange = async (course, toYear, toTerm, fromYear = null, fromTerm = null) => {
    if (!isAuthenticated) return;

    try {
      await axios.post(
        `${API_BASE_URL}/roadmap/change`,
        {
          courseId: course.id,
          toYear: parseInt(toYear),
          toTerm: toTerm,
          fromYear: fromYear ? parseInt(fromYear) : null,
          fromTerm: fromTerm,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const updatedCourses = { ...planCourses };
      if (fromYear && fromTerm) {
        const fromKey = `${fromYear}_${fromTerm}`;
        updatedCourses[fromKey] = updatedCourses[fromKey].filter((c) => c.id !== course.id);
      }
      const toKey = `${toYear}_${toTerm}`;
      if (!updatedCourses[toKey]) updatedCourses[toKey] = [];
      updatedCourses[toKey].push(course);
      setPlanCourses(updatedCourses);
    } catch (error) {
      console.error('Error updating roadmap:', error);
    }
  };

  const handleDrop = async (course, year, term, sourceType) => {
    if (!isAuthenticated) return;

    const existingTerm = findExistingCourseTerm(course.id);
    if (sourceType === 'panel' && existingTerm) {
      setMoveDialog({
        open: true,
        course,
        existingTerm: existingTerm.term,
        existingYear: existingTerm.year,
        targetTerm: term,
        targetYear: year,
      });
      return;
    }
    await handleCourseChange(course, year, term, existingTerm?.year, existingTerm?.term);
  };

  const [moveDialog, setMoveDialog] = useState({
    open: false,
    course: null,
    existingTerm: null,
    existingYear: null,
    targetTerm: null,
    targetYear: null,
  });

  if (loading) return null;

  if (!isAuthenticated) {
    return (
      <Container sx={{ mt: 4, pb: 8 }}>
        <Typography variant="h6" color="text.secondary" align="center">
          Sign in to view your roadmap.
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <TrashZone
        isDragging={isDragging}
        onDelete={async (course) => {
          const existingTerm = findExistingCourseTerm(course.id);
          if (!existingTerm) return;
          try {
            await axios.post(
              `${API_BASE_URL}/roadmap/change`,
              {
                courseId: course.id,
                fromYear: existingTerm.year,
                fromTerm: existingTerm.term,
                toYear: null,
                toTerm: null,
                toTrash: true,
              },
              { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            const updatedCourses = { ...planCourses };
            const termKey = `${existingTerm.year}_${existingTerm.term}`;
            updatedCourses[termKey] = updatedCourses[termKey].filter((c) => c.id !== course.id);
            setPlanCourses(updatedCourses);
          } catch (error) {
            console.error('Error deleting course:', error);
          }
        }}
        isCollapsed={isCollapsed}
      />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box onDragStart={() => setIsDragging(true)} onDragEnd={() => setIsDragging(false)}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={9}>
              <Box sx={{ overflowX: 'auto' }}>
                {academicYears.map((academicYear) => (
                  <Box
                    key={academicYear.year}
                    sx={{ display: 'flex', flexWrap: 'nowrap', mb: 3 }}
                  >
                    {academicYear.terms.map(({ year, term }) => (
                      <TermColumn
                        key={`${year}_${term}`}
                        year={year}
                        term={term}
                        courses={planCourses[`${year}_${term}`] || []}
                        isSelected={selectedTerm?.year === year && selectedTerm?.term === term}
                        onTermSelect={handleTermSelect}
                        onRemoveCourse={(courseId) =>
                          setConfirmDialog({ open: true, courseId, year, term })
                        }
                        onDropCourse={handleDrop}
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
                      targetYear: selectedTerm.year,
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
          onClose={() => setConfirmDialog(confirmDialogInitial)}
          onConfirm={async () => {
            try {
              await axios.post(
                `${API_BASE_URL}/roadmap/change`,
                {
                  courseId: confirmDialog.courseId,
                  fromYear: confirmDialog.year,
                  fromTerm: confirmDialog.term,
                  toYear: null,
                  toTerm: null,
                  toTrash: true,
                },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
              );
              const termKey = `${confirmDialog.year}_${confirmDialog.term}`;
              const updatedCourses = { ...planCourses };
              updatedCourses[termKey] = updatedCourses[termKey].filter(
                (course) => course.id !== confirmDialog.courseId
              );
              setPlanCourses(updatedCourses);
            } catch (error) {
              console.error('Error removing course:', error);
            } finally {
              setConfirmDialog(confirmDialogInitial);
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