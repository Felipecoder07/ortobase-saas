import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error';

interface ToastMessage {
  id: number;
  msg: string;
  type: ToastType;
}

interface ToastContextData {
  showToast: (msg: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

let toastId = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((msg: string, type: ToastType) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {toasts.map((toast) => (
          <div key={toast.id} style={{
            background: toast.type === 'success' ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${toast.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
            color: toast.type === 'success' ? '#15803D' : '#B91C1C',
            padding: '12px 16px', borderRadius: '8px', fontSize: '13.5px', fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            {toast.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
