import React, { createContext, useContext } from 'react';
import { useToast } from '../hooks/useToast';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const toastMethods = useToast();

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
    </ToastContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useNotification must be used within ToastProvider');
  }
  return context;
};

export default ToastContext;
