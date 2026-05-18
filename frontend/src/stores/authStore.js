import { create } from 'zustand';
import Toast from 'react-native-toast-message';
import * as storage from '../lib/storage';
import api from '../lib/api';

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,

  // Initialize auth state from universal storage
  initialize: async () => {
    try {
      const accessToken = await storage.getItem('access_token');
      if (accessToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        // Verify token by fetching profile
        const response = await api.get('/users/me/');
        set({
          user: response.data,
          accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      // Token expired or invalid
      try {
        await storage.removeItem('access_token');
        await storage.removeItem('refresh_token');
      } catch (e) {}
      delete api.defaults.headers.common['Authorization'];
      set({ isLoading: false, user: null, isAuthenticated: false });
    }
  },

  // Login
  login: async (identifier, password) => {
    const cleanIdentifier = String(identifier ?? '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .trim();
    
    // Send identifier under multiple common keys to ensure backend compatibility
    const payload = {
      identifier: cleanIdentifier,
      email: cleanIdentifier,
      username: cleanIdentifier,
      password
    };
    
    try {
      console.log('[AuthStore] Attempting login for:', cleanIdentifier);
      const response = await api.post('/auth/login/', payload);
      const { user, access, refresh } = response.data;

      console.log('[AuthStore] Login successful, user role:', user.role);

      await storage.setItem('access_token', access);
      await storage.setItem('refresh_token', refresh);
      
      // Explicitly set header to avoid race condition with storage
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      set({
        user,
        accessToken: access,
        isAuthenticated: true,
      });
      return user;
    } catch (error) {
      console.error('[AuthStore] Login failed:', error.response?.data || error.message);
      const message = error.response?.data?.detail || error.message || 'Login failed';
      Toast.show({ type: 'error', text1: 'Login Error', text2: message });
      throw error;
    }
  },

  // Register
  register: async (data) => {
    try {
      const response = await api.post('/auth/register/', data);
      const { access, refresh, user } = response.data;

      await storage.setItem('access_token', access);
      await storage.setItem('refresh_token', refresh);

      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      set({
        user,
        accessToken: access,
        isAuthenticated: true,
      });

      return user;
    } catch (error) {
      const message = error.response?.data?.detail || error.message || 'Registration failed';
      Toast.show({ type: 'error', text1: 'Registration Error', text2: message });
      throw error;
    }
  },

  // Verify OTP
  verifyOtp: async (data) => {
    const response = await api.post('/auth/otp/verify/', data);
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      const refresh = await storage.getItem('refresh_token');
      if (refresh) {
        await api.post('/auth/logout/', { refresh }).catch(() => {});
      }
    } catch (e) {}

    try {
      await storage.removeItem('access_token');
      await storage.removeItem('refresh_token');
    } catch (e) {}

    delete api.defaults.headers.common['Authorization'];

    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },

  // Fetch latest profile
  fetchProfile: async () => {
    try {
      const response = await api.get('/users/me/');
      set({ user: response.data });
      return response.data;
    } catch (error) {
      console.error('[AuthStore] Fetch profile failed:', error);
      return null;
    }
  },

  // Update user in store (after profile edit)
  setUser: (user) => set({ user }),
}));

export default useAuthStore;

