'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastItem {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export default function ToastDemo() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const id = Date.now();
    const newToast: ToastItem = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      position: 'relative'
    }}>
      {/* Demo Controls */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '1rem',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
        }}>
          Toast Notification System
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '1.125rem',
          marginBottom: '3rem'
        }}>
          Click the buttons below to test different notification types
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => addToast('success', 'Order Placed!', 'Your order has been successfully placed and is being processed.')}
            style={{
              padding: '1.25rem 1.5rem',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
            }}
          >
            Success Toast
          </button>

          <button
            onClick={() => addToast('error', 'Payment Failed', 'Unable to process payment. Please check your M-Pesa and try again.')}
            style={{
              padding: '1.25rem 1.5rem',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
            }}
          >
            Error Toast
          </button>

          <button
            onClick={() => addToast('warning', 'Low Stock Alert', 'Only 3 units left in stock. Order soon!')}
            style={{
              padding: '1.25rem 1.5rem',
              background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.3)';
            }}
          >
            Warning Toast
          </button>

          <button
            onClick={() => addToast('info', 'New Feature', 'Check out our new solar panel calculator in the tools section!')}
            style={{
              padding: '1.25rem 1.5rem',
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
            }}
          >
            Info Toast
          </button>
        </div>

        {/* Instructions */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'left'
        }}>
          <h3 style={{
            color: 'white',
            fontSize: '1.25rem',
            marginBottom: '1rem',
            fontWeight: '700'
          }}>
            💡 Features
          </h3>
          <ul style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1rem',
            lineHeight: '1.8',
            margin: 0,
            paddingLeft: '1.5rem'
          }}>
            <li>Auto-dismisses after 5 seconds</li>
            <li>Manual dismiss with X button</li>
            <li>Smooth slide-in animation</li>
            <li>Progress bar showing time remaining</li>
            <li>Stacks multiple notifications</li>
            <li>Responsive for mobile & desktop</li>
            <li>4 types: Success, Error, Warning, Info</li>
          </ul>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
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
      width: 'calc(100vw - 40px)'
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
        position: 'relative'
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

// Export reusable toast hook
export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const id = Date.now();
    const newToast: ToastItem = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toast = {
    success: (title: string, message: string) => {
      addToast('success', title, message);
    },
    error: (title: string, message: string) => {
      addToast('error', title, message);
    },
    warning: (title: string, message: string) => {
      addToast('warning', title, message);
    },
    info: (title: string, message: string) => {
      addToast('info', title, message);
    }
  };

  return { toasts, toast, removeToast };
}
