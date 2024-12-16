// CourseCard.jsx
import { Card, CardContent, Typography, Box, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const CourseCard = ({ 
  course, 
  onAdd, 
  isDraggable = false,
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
