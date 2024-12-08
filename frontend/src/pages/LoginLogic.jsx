import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../api';
import LoginForm from './Forms/LoginForm';

export default function LoginLogic() {
    // this is a React state object for storing the login data in JavaScript object
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
  
    const handleSubmit = async (e) => {
        e.preventDefault();
        // this specific format of sending login data to the backend is required by FastAPI's OAuth2PasswordRequestForm
        const loginData = new FormData();
        loginData.append('username', formData.username);
        loginData.append('password', formData.password);

        try { 
            const response = await axios.post(`${API_BASE_URL}/token`, loginData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            localStorage.setItem('token', response.data.access_token);
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setError(`Invalid username or password
                     (Haven't signed up yet? Sign up now!)`);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <LoginForm
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            error={error}
        />
    );
}
