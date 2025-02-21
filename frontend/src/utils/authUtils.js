import axios from 'axios';
import API_BASE_URL from '../api';
import Cookies from 'js-cookie';

export const performPendingAction = async (token) => {
    const pendingAction = Cookies.get('pendingAction');
    if (!pendingAction) return;

    try {
        const action = JSON.parse(pendingAction);
        if (action.type === 'saveCourse') {
            await axios.post(`${API_BASE_URL}/save-course/${action.courseId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        } else if (action.type === 'addToRoadmap') {
            await axios.post(`${API_BASE_URL}/roadmap/change`, {
                courseId: action.courseId,
                year: action.year,
                term: action.term
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        }
    } catch (error) {
        console.error('Error performing pending action:', error);
    } finally {
        Cookies.remove('pendingAction');
    }
};