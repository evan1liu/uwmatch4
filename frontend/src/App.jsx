import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

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
                        path="/dashboard" 
                        element={<Dashboard />} 
                    />
                    <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Container>
    );
}

export default App;