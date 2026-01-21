'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

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

const toastConfigs = {
  success: {
    icon: CheckCircle,
    color: '#10B981',
    bgColor: '#ECFDF5'
  },
  error: {
    icon: XCircle,
    color: '#EF4444',
    bgColor: '#FEF2F2'
  },
  warning: {
    icon: AlertCircle,
    color: '#F59E0B',
    bgColor: '#FFFBEB'
  },
  info: {
    icon: Info,
    color: '#3B82F6',
    bgColor: '#EFF6FF'
  }
};

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastItem['type'], title: string, message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => removeToast(id), 5000);
  }, [removeToast]);

  const toast = {
    success: (t: string, m: string) => addToast('success', t, m),
    error: (t: string, m: string) => addToast('error', t, m),
    warning: (t: string, m: string) => addToast('warning', t, m),
    info: (t: string, m: string) => addToast('info', t, m),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }: { toasts: ToastItem[]; removeToast: (id: number) => void }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <ToastItemComponent key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
      <style>{`
        .toast-container {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 420px;
          width: calc(100vw - 48px);
          pointer-events: none;
        }

        @media (max-width: 640px) {
          .toast-container {
            top: 12px;
            right: 50%;
            left: auto;
            transform: translateX(50%);
            max-width: 90%;
            width: auto;
          }
        }
      `}</style>
    </div>
  );
}

function ToastItemComponent({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const [isClosing, setIsClosing] = useState(false);
  const config = toastConfigs[toast.type];
  const Icon = config.icon;

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(handleClose, 4700);
    return () => clearTimeout(timer);
  }, [handleClose]);

  return (
    <div className={`toast-item ${isClosing ? 'closing' : ''}`}>
      <div className="toast-icon-wrapper" style={{ background: config.bgColor, color: config.color }}>
        <Icon size={22} />
      </div>
      
      <div className="toast-body">
        <h4 className="toast-title">{toast.title}</h4>
        <p className="toast-message">{toast.message}</p>
      </div>

      <button onClick={handleClose} className="toast-close-btn">
        <X size={18} />
      </button>

      <style>{`
        .toast-item {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          border-left: 5px solid ${config.color};
          animation: slideIn 0.3s ease-out;
          pointer-events: auto;
          transition: all 0.3s ease;
        }

        .toast-item.closing {
          opacity: 0;
          transform: translateX(20px);
          scale: 0.95;
        }

        .toast-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .toast-body {
          flex: 1;
        }

        .toast-title {
          margin: 0 0 4px 0;
          font-size: 1rem;
          font-weight: 700;
          color: #1a1a1a;
        }

        .toast-message {
          margin: 0;
          font-size: 0.875rem;
          color: #666;
          line-height: 1.5;
        }

        .toast-close-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: #999;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .toast-close-btn:hover {
          background: #f5f5f5;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          .toast-item {
            animation: slideDown 0.3s ease-out;
            padding: 12px;
          }
          .toast-item.closing {
            transform: translateY(-20px);
          }
          .toast-title { font-size: 0.95rem; }
          .toast-message { font-size: 0.8125rem; }
        }
      `}</style>
    </div>
  );
}
