import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../api';

import SignupForm from './Forms/SignupForm';
import OnboardingForm from './Forms/OnboardingForm';
import LoadingOverlay from '../Effects/LoadingOverlay';

import { majors, years } from '../Data/MajorsAndYears';

export default function SignupLogic() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        major: '',
        year: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [stage, setStage] = useState('signup'); 
    // 'singup' for initial singup form, 'onboarding' after success

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            setLoading(true);
            const submitData = {
                fullName: `${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email,
                password: formData.password,
            };
            await axios.post(`${API_BASE_URL}/signup`, submitData);

            // Simulate short delay
            function delay(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            await delay(30);

            const loginData = new FormData();
            loginData.append('username', formData.email);
            loginData.append('password', formData.password);

            const response = await axios.post(`${API_BASE_URL}/token`, loginData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            localStorage.setItem('token', response.data.access_token);

            // Instead of navigate('/onboarding'), we switch to onboarding stage
            setStage('onboarding');
            setError('');
        } catch (err) {
            if (err.response && err.response.status === 400) {
                setError('This email is already signed up. Please login with your existing account.');
            } else if (err.response) {
                setError(err.response.data.detail || 'Registration failed. Please try again.');
            } else if (err.request) {
                setError('Unable to reach the server. Please check your connection.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOnboardingSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const submitData = {
                major: formData.major,
                year: formData.year,
            };
            // Example onboarding endpoint
            await axios.post(`${API_BASE_URL}/onboarding`, submitData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            navigate('/dashboard');
        } catch (err) {
            setError('Failed to save additional information.');
            console.error('Onboarding error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleMajorChange = (event, newValue) => {
        setFormData({ ...formData, major: newValue });
    };

    const handleYearChange = (event, newValue) => {
        setFormData({ ...formData, year: newValue });
    };

    return (
        <>
            {loading && <LoadingOverlay />}
            {stage === 'signup' ? (
                <SignupForm
                    formData={formData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    loading={loading}
                    error={error}
                />
            ) : (
                <OnboardingForm
                    formData={formData}
                    handleMajorChange={handleMajorChange}
                    handleYearChange={handleYearChange}
                    handleOnboardingSubmit={handleOnboardingSubmit}
                    error={error}
                    loading={loading}
                    majors={majors}
                    years={years}
                />
            )}
        </>
    );
}
