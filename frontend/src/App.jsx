import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import LoginLogic from './pages/LoginLogic';
import OnboardingLogic from './pages/OnboardingLogic'; // New file, see below
import Profile from './pages/Profile';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import SavedCourses from './pages/SavedCourses';
import Roadmap from './pages/Roadmap';
import Sidebar from './Components/Sidebar';
import BottomNav from './Components/BottomNav';
import { useLocation } from 'react-router-dom';
import { SidebarProvider } from './contexts/SidebarContext';

function App() {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/onboarding';

    return (
        <SidebarProvider>
            <Box sx={{ display: 'flex' }}>
                {!isAuthPage && <Sidebar />}
                <Box sx={{ flexGrow: 1, pb: !isAuthPage ? 0 : 7 }}>
                    <Routes>
                        <Route path="/login" element={<LoginLogic />} />
                        <Route path="/onboarding" element={<OnboardingLogic />} />
                        <Route path="/" element={<Navigate to="/courses" />} />
                        <Route path="/courses" element={<CourseList />} />
                        <Route path="/courses/:id" element={<CourseDetail />} />
                        <Route path="/saved-courses" element={<SavedCourses />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/roadmap" element={<Roadmap />} />
                    </Routes>
                </Box>
                {!isAuthPage && <BottomNav />}
            </Box>
        </SidebarProvider>
    );
}

export default App;