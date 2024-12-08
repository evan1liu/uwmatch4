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
import BottomNav from './Components/BottomNav';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <Box sx={{ display: 'flex' }}>
      {!isAuthPage && <Sidebar />}
      <Box sx={{ flexGrow: 1, pb: !isAuthPage ? 0 : 7 }}>
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
      {!isAuthPage && <BottomNav />}
    </Box>
  );
}

export default App;
