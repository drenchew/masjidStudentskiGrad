import axios from 'axios';

// Configure base URL from environment variable
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 seconds for most requests (prayer times APIs are slow)
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

// Add response interceptor to handle errors and retry logic
let retryCount = {};

instance.interceptors.response.use(
  (response) => {
    // Clear retry count on success
    const key = response.config.url;
    delete retryCount[key];
    return response;
  },
  (error) => {
    // Get request key for retry tracking
    const key = error.config?.url || 'unknown';
    retryCount[key] = (retryCount[key] || 0) + 1;

    // Retry logic for timeout and network errors
    const shouldRetry = 
      (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') &&
      retryCount[key] <= 2 && // Max 2 retries
      error.config; // Only retry if config exists

    if (shouldRetry) {
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, retryCount[key] - 1) * 1000;
      
      return new Promise(resolve => setTimeout(() => resolve(instance(error.config)), delay));
    }

    // Don't auto-redirect here, let components handle it
    // This prevents redirect loops
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Auth error - components will handle redirect
    }
    
    return Promise.reject(error);
  }
);

export default instance;
