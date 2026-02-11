import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ type = 'success', message, duration = 4000, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
          icon: <FaCheckCircle className="text-2xl" />,
          border: 'border-l-4 border-green-300',
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-rose-600',
          icon: <FaExclamationCircle className="text-2xl" />,
          border: 'border-l-4 border-red-300',
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-500 to-orange-600',
          icon: <FaExclamationCircle className="text-2xl" />,
          border: 'border-l-4 border-yellow-300',
        };
      case 'info':
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-cyan-600',
          icon: <FaInfoCircle className="text-2xl" />,
          border: 'border-l-4 border-blue-300',
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`fixed top-6 right-6 flex items-center gap-4 px-6 py-4 rounded-lg shadow-2xl text-white ${styles.bg} ${styles.border} transform transition-all duration-300 z-50 max-w-md ${
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div className="flex-shrink-0">{styles.icon}</div>
      <div className="flex-1 pr-2">
        <p className="font-semibold text-sm sm:text-base leading-tight">{message}</p>
      </div>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onClose, 300);
        }}
        className="flex-shrink-0 ml-2 hover:opacity-75 transition-opacity"
      >
        <FaTimes className="text-lg" />
      </button>
    </div>
  );
};

export default Toast;
