import { Card, CardContent, Typography, Box, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Draggable } from 'react-beautiful-dnd';

const CourseCard = ({ 
  course, 
  index, 
  isInPlan, 
  onAdd, 
  onRemove, 
  isDraggable = false 
}) => {
  const cardContent = (
    <Card 
      sx={{ 
        mb: 1,
        '&:hover': {
          boxShadow: 3,
        },
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          {onAdd && (
            <IconButton onClick={() => onAdd(course.id)}>
              {isInPlan ? <AddCircleIcon /> : <AddCircleOutlineIcon />}
            </IconButton>
          )}
          {onRemove && (
            <IconButton onClick={() => onRemove(course.id)} color="error">
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  if (isDraggable) {
    return (
      <Draggable draggableId={course.id.toString()} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              ...provided.draggableProps.style,
              opacity: snapshot.isDragging ? 0.8 : 1,
            }}
          >
            {cardContent}
          </div>
        )}
      </Draggable>
    );
  }

  return cardContent;
};

export default CourseCard; 