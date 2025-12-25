import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [history, setHistory] = useState([]);
  const MAX_HISTORY = 50;

  const showToast = useCallback((message, type = 'info', duration = 3000, group = false) => {
    const id = Date.now() + Math.random();
    const timestamp = new Date();
    const toast = { id, message, type, duration, timestamp, group };
    
    // Групування однакових повідомлень
    if (group) {
      setToasts((prev) => {
        const existing = prev.find((t) => t.message === message && t.type === type);
        if (existing) {
          // Оновлюємо існуючий toast з лічильником
          const count = existing.count || 1;
          return prev.map((t) =>
            t.id === existing.id ? { ...t, count: count + 1, timestamp } : t
          );
        }
        return [...prev, toast];
      });
    } else {
      setToasts((prev) => [...prev, toast]);
    }

    // Додаємо в історію
    setHistory((prev) => {
      const newHistory = [{ ...toast, count: 1 }, ...prev].slice(0, MAX_HISTORY);
      return newHistory;
    });

    // Автоматично видаляємо через duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast, history, clearHistory }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback якщо не в провайдері
    return {
      showToast: (message, type, duration) => {
        console.log(`[Toast ${type}]: ${message}`);
        // Fallback до alert якщо немає провайдера
        if (typeof window !== 'undefined' && window.alert) {
          alert(message);
        }
      },
      removeToast: () => {},
      history: [],
      clearHistory: () => {},
    };
  }
  return context;
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Анімація появи
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-600 border-green-500';
      case 'error':
        return 'bg-red-600 border-red-500';
      case 'warning':
        return 'bg-yellow-600 border-yellow-500';
      case 'info':
      default:
        return 'bg-blue-600 border-blue-500';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div
      className={`pointer-events-auto border-2 rounded-lg p-4 shadow-lg min-w-[250px] max-w-[350px] transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      } ${getToastStyles()}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{getIcon()}</span>
        <div className="flex-1">
          <p className="text-white text-sm font-semibold">
            {toast.message}
            {toast.count > 1 && (
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-xs">
                x{toast.count}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="text-white/80 hover:text-white text-xl font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
};

