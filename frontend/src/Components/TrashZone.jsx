// frontend/src/Components/TrashZone.jsx
import React, { useState } from 'react';
import { Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const TrashZone = ({ onDelete, isDragging }) => {
  const [isOver, setIsOver] = useState(false);

  if (!isDragging) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        right: '280px',
        width: '150px',
        backgroundColor: isOver ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'all 0.3s ease',
        zIndex: 1000,
        borderLeft: isOver ? '2px dashed rgba(0, 0, 0, 0.3)' : '2px dashed transparent',
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        try {
          const courseData = JSON.parse(e.dataTransfer.getData('application/json'));
          onDelete(courseData);
        } catch (error) {
          console.error('Error parsing dropped data:', error);
        }
        setIsOver(false);
      }}
    >
      <DeleteIcon sx={{ 
        fontSize: 24,
        color: isOver ? 'action.active' : 'action.disabled',
        transform: isOver ? 'scale(1.2)' : 'scale(1)',
        transition: 'all 0.3s ease',
        opacity: isOver ? 1 : 0.5,
      }} />
    </Box>
  );
};

export default TrashZone;