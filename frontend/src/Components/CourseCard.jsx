// CourseCard.jsx
import { Card, CardContent, Typography, Box, IconButton } from '@mui/material';
// below is the add button with only the border for "to add"
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
// below is the add button that is filled for "added"
import AddCircleIcon from '@mui/icons-material/AddCircle';

const CourseCard = ({ 
  course, 
  onAdd, // this is the function for adding a course to the roadmap for the right side search panel
  isDraggable = false, // this determines if a course is draggable. it's draggable when it's in the roadmap but not draggable when it's in the search panel
  isInPlan = false 
}) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/json', JSON.stringify(course));
  };

  const cardContent = (
    <Card 
      draggable={isDraggable}
      onDragStart={isDraggable ? handleDragStart : undefined}
      sx={{ 
        mb: 1,
        '&:hover': {
          boxShadow: 3,
        },
        cursor: isDraggable ? 'grab' : 'default'
      }}
    >
      <CardContent>
        <Typography variant="h6">{course.code}</Typography>
        <Typography variant="body2" color="text.secondary">
          {course.title}
        </Typography>
        <Typography variant="body2">
          {course.credits} credits
        </Typography>
        {/* when we're adding a course to the roadmap in the search panel, we want to have the "to add" button or the "added" button*/}
        {onAdd && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <IconButton onClick={() => onAdd(course.id)}>
              {isInPlan ? <AddCircleIcon /> : <AddCircleOutlineIcon />}
            </IconButton>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return cardContent;
};

export default CourseCard;
