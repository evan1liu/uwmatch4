const API_BASE_URL = import.meta.env.DEV 
    ? 'http://127.0.0.1:8000/api'  // Development
    : '/api';                       // Production

export default API_BASE_URL;
