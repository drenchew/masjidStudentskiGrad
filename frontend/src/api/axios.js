import axios from 'axios';

// Configure base URL from environment variable
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't auto-redirect here, let components handle it
    // This prevents redirect loops
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Auth error detected, components will handle redirect');
    }
    return Promise.reject(error);
  }
);

export default instance;
