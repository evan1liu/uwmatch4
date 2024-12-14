import { Card, Box, Typography, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Droppable } from 'react-beautiful-dnd';
import CourseCard from './CourseCard';

const TermColumn = ({ 
  year, 
  term, 
  courses, 
  isSelected, 
  onTermSelect, 
  onRemoveCourse 
}) => {
  return (
    <Card 
      sx={{ 
        width: 280, // Fixed width
        minHeight: 200,
        m: 1,
        backgroundColor: isSelected ? 'action.hover' : 'background.paper',
        transition: 'background-color 0.2s ease',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {`${term} ${year}`}
        </Typography>
        
        <Droppable droppableId={`${year}-${term}`}>
          {(provided, snapshot) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                minHeight: 100,
                backgroundColor: snapshot.isDraggingOver ? 'action.hover' : 'transparent',
                transition: 'background-color 0.2s ease',
              }}
            >
              {courses.map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={index}
                  onRemove={() => onRemoveCourse(course.id)}
                  isDraggable
                />
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <IconButton 
            onClick={() => onTermSelect(year, term)}
            sx={{ 
              width: '60px',
              height: '60px',
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
          >
            <AddCircleOutlineIcon sx={{ fontSize: 40 }} />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
};

export default TermColumn; 