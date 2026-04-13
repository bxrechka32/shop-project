// frontend/src/store/authStore.js
import { create } from 'zustand';
import api from '../utils/api';

const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: true,

  init: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return set({ isLoading: false });
    try {
      const { data } = await api.get('/users/me');
      set({ user: data, isLoading: false });
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, isLoading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    set({ user: data.user });
    return data.user;
  },

  register: async (fields) => {
    const { data } = await api.post('/auth/register', fields);
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    set({ user: data.user });
    return data.user;
  },

  logout: async () => {
    const refresh_token = localStorage.getItem('refresh_token');
    await api.post('/auth/logout', { refresh_token }).catch(() => {});
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null });
  },

  isAdmin: () => get().user?.role === 'ADMIN',
  isSeller: () => ['SELLER', 'ADMIN'].includes(get().user?.role),
}));

export default useAuthStore;
