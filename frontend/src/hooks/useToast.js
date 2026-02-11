import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message, duration = 4000) => {
    return addToast('success', message, duration);
  }, [addToast]);

  const error = useCallback((message, duration = 5000) => {
    return addToast('error', message, duration);
  }, [addToast]);

  const warning = useCallback((message, duration = 4000) => {
    return addToast('warning', message, duration);
  }, [addToast]);

  const info = useCallback((message, duration = 4000) => {
    return addToast('info', message, duration);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};

export default useToast;
