import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the JWT token to all requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // If the error is due to authentication (401), redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth');
      window.location.href = '/';
    }
    return Promise.reject(error);
  },
);

export const login = async (username, password, rememberMe = false) => {
  try {
    console.log('Attempting login with:', { username, rememberMe });
    const response = await api.post('/api/authenticate', {
      username,
      password,
      rememberMe,
    });
    console.log('Login response:', response.data);

    if (response.data.id_token) {
      // Store the token in the appropriate storage based on rememberMe
      if (rememberMe) {
        localStorage.setItem('auth', response.data.id_token);
        localStorage.setItem('rememberMe', 'true');
      } else {
        sessionStorage.setItem('auth', response.data.id_token);
        localStorage.removeItem('rememberMe');
      }
      console.log('Token stored in', rememberMe ? 'localStorage' : 'sessionStorage');
      return { success: true };
    }
    console.log('No token received in response');
    return { success: false, message: 'No token received' };
  } catch (error) {
    console.error('Login error details:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Authentication failed',
    };
  }
};

export const logout = () => {
  localStorage.removeItem('auth');
  sessionStorage.removeItem('auth');
  localStorage.removeItem('rememberMe');
  window.location.href = '/';
};

export const isAuthenticated = () => {
  // Check both localStorage and sessionStorage for the token
  const localToken = localStorage.getItem('auth');
  const sessionToken = sessionStorage.getItem('auth');
  const token = localToken || sessionToken;
  console.log('isAuthenticated - token exists:', !!token);
  return !!token;
};

export const getAuthToken = () => {
  // Return token from appropriate storage
  return localStorage.getItem('auth') || sessionStorage.getItem('auth');
};

export default api;
