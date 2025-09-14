// Toast Notification Service
import { useState, useEffect } from 'react';

class ToastService {
  constructor() {
    this.toasts = [];
    this.listeners = new Set();
    this.nextId = 1;
  }

  // Subscribe to toast updates
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners of state change
  notify() {
    this.listeners.forEach(callback => callback([...this.toasts]));
  }

  // Add a toast
  addToast(type, message, options = {}) {
    const toast = {
      id: this.nextId++,
      type,
      message,
      duration: options.duration || (type === 'error' ? 5000 : 3000),
      timestamp: Date.now(),
      ...options
    };

    this.toasts.push(toast);
    this.notify();

    // Auto remove after duration
    if (toast.duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, toast.duration);
    }

    return toast.id;
  }

  // Remove a toast
  removeToast(id) {
    const index = this.toasts.findIndex(toast => toast.id === id);
    if (index > -1) {
      this.toasts.splice(index, 1);
      this.notify();
    }
  }

  // Clear all toasts
  clearAll() {
    this.toasts = [];
    this.notify();
  }

  // Convenience methods
  success(message, options = {}) {
    return this.addToast('success', message, options);
  }

  error(message, options = {}) {
    return this.addToast('error', message, options);
  }

  warning(message, options = {}) {
    return this.addToast('warning', message, options);
  }

  info(message, options = {}) {
    return this.addToast('info', message, options);
  }
}

// Create singleton instance
const toastService = new ToastService();

// React hook for using toasts
export const useToasts = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = toastService.subscribe(setToasts);
    return unsubscribe;
  }, []);

  return {
    toasts,
    addToast: toastService.addToast.bind(toastService),
    removeToast: toastService.removeToast.bind(toastService),
    clearAll: toastService.clearAll.bind(toastService),
    success: toastService.success.bind(toastService),
    error: toastService.error.bind(toastService),
    warning: toastService.warning.bind(toastService),
    info: toastService.info.bind(toastService)
  };
};

export default toastService;