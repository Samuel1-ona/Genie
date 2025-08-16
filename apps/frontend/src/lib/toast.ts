import { useToasts } from '@/store/ui';

// Toast utility functions
export const useToast = () => {
  const { addToast } = useToasts();

  return {
    success: (title: string, description?: string) =>
      addToast({ type: 'success', title, description }),

    error: (title: string, description?: string) =>
      addToast({ type: 'error', title, description }),

    warning: (title: string, description?: string) =>
      addToast({ type: 'warning', title, description }),

    info: (title: string, description?: string) =>
      addToast({ type: 'info', title, description }),

    // Custom toast with duration
    custom: (toast: {
      type: 'success' | 'error' | 'warning' | 'info';
      title: string;
      description?: string;
      duration?: number;
    }) => addToast(toast),
  };
};

// Standalone toast functions (for use outside of components)
let toastStore: ReturnType<typeof useToasts> | null = null;

export const setToastStore = (store: ReturnType<typeof useToasts>) => {
  toastStore = store;
};

export const toast = {
  success: (title: string, description?: string) => {
    if (toastStore) {
      toastStore.addToast({ type: 'success', title, description });
    }
  },

  error: (title: string, description?: string) => {
    if (toastStore) {
      toastStore.addToast({ type: 'error', title, description });
    }
  },

  warning: (title: string, description?: string) => {
    if (toastStore) {
      toastStore.addToast({ type: 'warning', title, description });
    }
  },

  info: (title: string, description?: string) => {
    if (toastStore) {
      toastStore.addToast({ type: 'info', title, description });
    }
  },
};
