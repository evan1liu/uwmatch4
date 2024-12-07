import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import SavedCourses from './pages/SavedCourses';
import Onboarding from './pages/Onboarding'

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
            <Container>
                <Routes>
                    <Route 
                        path="/login" 
                        element={<Login setIsAuthenticated={setIsAuthenticated} />} 
                    />
                    <Route 
                        path="/register" 
                        element={<Register />} 
                    />
                    <Route 
                        path="/onboarding" 
                        element={<Onboarding />} 
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