// TermColumn.jsx
import React, { memo } from 'react';
import { Card, Box, Typography, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CourseCard from './CourseCard';

const TermColumn = memo(({ year, term, courses, isSelected, onTermSelect, onRemoveCourse, onDropCourse }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '';
    try {
      const course = JSON.parse(e.dataTransfer.getData('application/json'));
      const sourceType = e.dataTransfer.getData('sourceType') || 'term';
      console.log('TermColumn Drop:', { course, year, term, sourceType });
      onDropCourse(course, year, term, sourceType);
    } catch (error) {
      console.error('Error in TermColumn drop:', error);
    }
  };

  return (
    <Card 
      sx={{ 
        width: 280,
        minHeight: 200,
        m: 1,
        backgroundColor: isSelected ? 'action.hover' : 'background.paper',
        transition: 'background-color 0.2s ease',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="h6">
            {term} {year}
          </Typography>
          <IconButton 
            onClick={(e) => {
              e.stopPropagation(); // Prevent term selection when clicking the add button
              onTermSelect(year, term);
            }}
            color={isSelected ? "primary" : "default"}
          >
            <AddCircleOutlineIcon />
          </IconButton>
        </Box>
        
        <Box
          sx={{
            minHeight: 100,
            transition: 'background-color 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            padding: 1
          }}
        >
          {Array.isArray(courses) && courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onRemove={() => onRemoveCourse(course.id)}
              isDraggable={true}
            />
          ))}
        </Box>
      </Box>
    </Card>
  );
});

TermColumn.displayName = 'TermColumn';

export default TermColumn;