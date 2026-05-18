import { create } from 'zustand';
import api from '../lib/api';

const useNotificationStore = create((set) => ({
  unreadCount: 0,

  fetchUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count/');
      set({ unreadCount: response.data.unread_count });
    } catch (error) {
      // Silently fail
    }
  },

  decrementCount: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

  resetCount: () => set({ unreadCount: 0 }),
}));

export default useNotificationStore;
