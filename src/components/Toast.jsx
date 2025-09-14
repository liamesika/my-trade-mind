import React, { useEffect, useState } from 'react';
import { useToasts } from '../services/toastService';
import '../styles/toast.css';

const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 250);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  return (
    <div 
      className={`toast toast--${toast.type} ${isVisible ? 'toast--visible' : ''} ${isLeaving ? 'toast--leaving' : ''}`}
    >
      <div className="toast__content">
        <span className="toast__icon">{getIcon()}</span>
        <span className="toast__message">{toast.message}</span>
        <button 
          className="toast__close" 
          onClick={handleRemove}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div className="toast__progress" style={{
        animationDuration: `${toast.duration}ms`
      }} />
    </div>
  );
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToasts();

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          toast={toast} 
          onRemove={removeToast} 
        />
      ))}
    </div>
  );
};

export default ToastContainer;