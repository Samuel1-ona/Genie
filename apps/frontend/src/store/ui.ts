import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

interface UIState {
  // Sidebar state
  sidebarOpen: boolean;

  // Theme state
  theme: Theme;

  // Toast state
  toasts: Toast[];

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarOpen: false,
      theme: 'system',
      toasts: [],

      // Actions
      toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

      setTheme: (theme: Theme) => set({ theme }),

      addToast: (toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: Toast = {
          id,
          duration: 5000,
          ...toast,
        };

        set(state => ({ toasts: [...state.toasts, newToast] }));

        // Auto-remove toast after duration
        if (newToast.duration && newToast.duration > 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, newToast.duration);
        }
      },

      removeToast: (id: string) =>
        set(state => ({
          toasts: state.toasts.filter(toast => toast.id !== id),
        })),

      clearToasts: () => set({ toasts: [] }),
    }),
    {
      name: 'genie-ui-storage',
      partialize: state => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

// Convenience hooks
export const useSidebar = () => {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  return { sidebarOpen, toggleSidebar, setSidebarOpen };
};

export const useTheme = () => {
  const { theme, setTheme } = useUIStore();
  return { theme, setTheme };
};

export const useToasts = () => {
  const { toasts, addToast, removeToast, clearToasts } = useUIStore();
  return { toasts, addToast, removeToast, clearToasts };
};
