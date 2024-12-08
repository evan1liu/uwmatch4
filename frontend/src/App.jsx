import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import LoginLogic from './pages/LoginLogic';
import SignupLogic from './pages/SignupLogic';
import Dashboard from './pages/Dashboard';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import SavedCourses from './pages/SavedCourses';
import Sidebar from './Components/Sidebar'

const DRAWER_WIDTH = 240;

function App() {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
        {/* Optional: Add a toolbar spacer if you have a top app bar */}
        <Routes>
          <Route path="/login" element={<LoginLogic />} />
          <Route path="/signup" element={<SignupLogic />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/saved-courses" element={<SavedCourses />} />
        </Routes>
      </Box>
  );
}

export default App;
