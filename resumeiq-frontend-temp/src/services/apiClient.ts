import axios from 'axios';
import { store } from '../store';
import { setCredentials, logOutState } from '../store/authSlice';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Forces cookies to pass between domains
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically injects bearer authorization strings
apiClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handles transparent token rotation loops
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Trigger automated sliding rotation endpoint
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = refreshResponse.data.data;

        // Re-inject updated details into local memory engine
        store.dispatch(setCredentials({ 
          user: store.getState().auth.user!, 
          accessToken 
        }));

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest); // Retry original request seamlessly
      } catch (refreshError) {
        store.dispatch(logOutState()); // Hard crash to login if refresh token fails
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);