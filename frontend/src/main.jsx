import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ToastProvider } from './context/ToastContext'
import { CartProvider } from './context/CartContext'
import ToastContainer from './components/ToastContainer'
import { useNotification } from './context/ToastContext'
import './index.css'
import './i18n'

// Wrapper component that has access to ToastContext
function AppWithToast() {
  const { toasts, removeToast } = useNotification();
  
  return (
    <>
      <App />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <CartProvider>
        <AppWithToast />
      </CartProvider>
    </ToastProvider>
  </React.StrictMode>,
)
