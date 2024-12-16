// frontend/src/Components/TrashZone.jsx
import React, { useState } from 'react';
import { Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

// Use the same constants as defined in Sidebar.jsx
const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 65;  // Match the value from Sidebar.jsx

const TrashZone = ({ onDelete, isDragging, isCollapsed }) => {
  const [isOver, setIsOver] = useState(false);

  // Add console.log to debug
  console.log('TrashZone - isCollapsed:', isCollapsed);

  if (!isDragging) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0, // Adjust based on your AppBar height
        bottom: 0,
        left: isCollapsed ? `${COLLAPSED_WIDTH}px` : `${DRAWER_WIDTH}px`,
        width: '30px',
        backgroundColor: isOver ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.02)', // Made slightly visible for debugging
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: theme => theme.transitions.create(['left'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        zIndex: 1000,
        borderLeft: '2px dashed rgba(0, 0, 0, 0.3)', // Always visible for debugging
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