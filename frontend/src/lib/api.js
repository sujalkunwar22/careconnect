import axios from 'axios';
import * as storage from './storage';
import { Platform } from 'react-native';

import Constants from 'expo-constants';

// API Configuration
const getBaseUrl = () => {
  // Prioritize environment variable if defined
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.trim();
  }

  // On web, use localhost
  if (Platform.OS === 'web') {
    return 'http://localhost:8000/api';
  }

  // On native, use the machine's IP address from Expo
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:8000/api`;
  }

  // Fallbacks
  return Platform.select({
    ios: 'http://localhost:8000/api',
    android: 'http://10.0.2.2:8000/api',
    default: 'http://localhost:8000/api',
  });
};

const API_BASE_URL = getBaseUrl();


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Attach access token
api.interceptors.request.use(
  async (config) => {
    // Try to get token from memory first
    let token = api.defaults.headers.common['Authorization'];
    
    if (!token) {
      const accessToken = await storage.getItem('access_token');
      if (accessToken) {
        token = `Bearer ${accessToken}`;
        config.headers['Authorization'] = token;
      }
    } else {
      config.headers['Authorization'] = token;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors and token refreshing
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await storage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        await storage.setItem('access_token', access);

        // Update API instance and retry original request
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        originalRequest.headers['Authorization'] = `Bearer ${access}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear session
        await storage.removeItem('access_token');
        await storage.removeItem('refresh_token');
        delete api.defaults.headers.common['Authorization'];
        
        // Note: authStore listener or manual logout redirect should be here
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const getMediaUrl = (url) => {
  if (!url) return null;
  if (typeof url !== 'string') return url;

  // Local device URIs or base64 data should be returned as is
  if (
    url.startsWith('data:') ||
    url.startsWith('file:') ||
    url.startsWith('content:')
  ) {
    return url;
  }

  // Get the base server URL (e.g. http://192.168.x.x:8000) from API_BASE_URL
  const serverBase = API_BASE_URL.replace(/\/api\/v1$/, '').replace(/\/api$/, '');

  if (url.startsWith('http://') || url.startsWith('https://')) {
    // If running on a physical device/emulator and url contains localhost, map it to server IP
    if (Platform.OS !== 'web' && (url.includes('localhost') || url.includes('127.0.0.1'))) {
      const serverHost = serverBase.replace(/^https?:\/\//, '');
      return url.replace(/localhost:\d+|127\.0\.0\.1:\d+/, serverHost);
    }
    return url;
  }

  // Relative path: prepend server base
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${serverBase}${cleanPath}`;
};

export default api;
export { API_BASE_URL };

