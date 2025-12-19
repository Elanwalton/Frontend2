'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

interface ToastItem {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface ToastContextType {
  toast: {
    success: (title: string, message: string) => void;
    error: (title: string, message: string) => void;
    warning: (title: string, message: string) => void;
    info: (title: string, message: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const id = Date.now();
    const newToast: ToastItem = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = {
    success: (title: string, message: string) => addToast('success', title, message),
    error: (title: string, message: string) => addToast('error', title, message),
    warning: (title: string, message: string) => addToast('warning', title, message),
    info: (title: string, message: string) => addToast('info', title, message),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: ToastItem[];
  removeToast: (id: number) => void;
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxWidth: '420px',
      width: 'calc(100vw - 40px)',
      pointerEvents: 'none'
    }}>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastProps {
  toast: ToastItem;
  onClose: () => void;
}

function Toast({ toast, onClose }: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const getConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: CheckCircle,
          gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          bgColor: '#ECFDF5',
          borderColor: '#10B981',
          iconColor: '#10B981',
          progressColor: '#10B981'
        };
      case 'error':
        return {
          icon: XCircle,
          gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
          bgColor: '#FEF2F2',
          borderColor: '#EF4444',
          iconColor: '#EF4444',
          progressColor: '#EF4444'
        };
      case 'warning':
        return {
          icon: AlertCircle,
          gradient: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
          bgColor: '#FFFBEB',
          borderColor: '#F59E0B',
          iconColor: '#F59E0B',
          progressColor: '#F59E0B'
        };
      case 'info':
        return {
          icon: Info,
          gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
          bgColor: '#EFF6FF',
          borderColor: '#3B82F6',
          iconColor: '#3B82F6',
          progressColor: '#3B82F6'
        };
      default:
        return {
          icon: Info,
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          bgColor: '#F3F4F6',
          borderColor: '#667eea',
          iconColor: '#667eea',
          progressColor: '#667eea'
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        animation: 'slideIn 0.3s ease-out',
        border: `2px solid ${config.borderColor}`,
        position: 'relative',
        pointerEvents: 'auto'
      }}
    >
      {/* Progress Bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: '4px',
        width: `${progress}%`,
        background: config.gradient,
        transition: 'width 0.1s linear'
      }} />

      <div style={{
        display: 'flex',
        gap: '12px',
        padding: '16px',
        alignItems: 'flex-start'
      }}>
        {/* Icon */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: config.bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Icon size={22} color={config.iconColor} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, paddingTop: '2px' }}>
          <h4 style={{
            margin: '0 0 4px 0',
            fontSize: '1rem',
            fontWeight: '700',
            color: '#1a1a1a',
            lineHeight: '1.3'
          }}>
            {toast.title}
          </h4>
          <p style={{
            margin: 0,
            fontSize: '0.875rem',
            color: '#666',
            lineHeight: '1.5'
          }}>
            {toast.message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f5f5f5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <X size={18} color="#666" />
        </button>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
