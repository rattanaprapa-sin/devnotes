import axios from 'axios';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let cachedToken = null;

// Listen for auth changes to instantly cache the token in memory
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.access_token) {
    cachedToken = session.access_token;
  } else {
    cachedToken = null;
  }
});

// Request Interceptor
axiosClient.interceptors.request.use(
  async (config) => {
    let token = cachedToken;
    
    if (!token) {
      // Fallback if listener hasn't fired yet
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        token = session.access_token;
        cachedToken = token;
      }
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosClient.interceptors.response.use(
  (response) => {
    // Standardize to always return the JSON data we expect
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Check if the error is 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to get a fresh session/token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        cachedToken = session.access_token;
        originalRequest.headers['Authorization'] = `Bearer ${cachedToken}`;
        // Retry the original request with the new token
        return axiosClient(originalRequest);
      } else {
        // If we really can't get a session, log them out
        cachedToken = null;
        await supabase.auth.signOut();
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
      }
    }
    
    // Pass the error message from the backend if it exists
    const message = error.response?.data?.message || error.response?.data?.error || error.message;
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
