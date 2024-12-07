import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import LoginLogic from './pages/LoginLogic';
import SignupLogic from './pages/SignupLogic';
import Dashboard from './pages/Dashboard';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import SavedCourses from './pages/SavedCourses';

function App() {
    return (
            <Container>
                <Routes>
                    <Route 
                        path="/login" 
                        element={<LoginLogic />} 
                    />
                    <Route 
                        path="/signup" 
                        element={<SignupLogic />} 
                    />
                    <Route 
                        path="/dashboard" 
                        element={<Dashboard />} 
                    />
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/courses" element={<CourseList />} />
                    <Route path="/courses/:id" element={<CourseDetail />} />
                    <Route path="/saved-courses" element={<SavedCourses />} />
            </Routes>
        </Container>
    );
}

export default App;