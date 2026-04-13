// frontend/src/store/toastStore.js
import { create } from 'zustand';

let _id = 0;

const useToastStore = create((set, get) => ({
  toasts: [],

  add: (message, type = 'info', duration = 4000) => {
    const id = ++_id;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().remove(id), duration);
    return id;
  },

  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  success: (msg) => get().add(msg, 'success'),
  error: (msg) => get().add(msg, 'error'),
  info: (msg) => get().add(msg, 'info'),
}));

export default useToastStore;
