import React, { createContext, useContext, useState, useCallback } from 'react';
import { Icons } from '../components/UI/Icons';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 space-y-2">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`flex items-center gap-2 p-4 rounded shadow-lg text-white transform transition-all duration-300 animate-slide-in ${
                            t.type === 'success' ? 'bg-green-600' : 
                            t.type === 'error' ? 'bg-red-600' : 
                            'bg-blue-600'
                        }`}
                    >
                        {t.type === 'success' && <Icons.Sparkles className="w-5 h-5" />}
                        {t.type === 'error' && <Icons.X className="w-5 h-5" />}
                        <span className="text-sm font-medium">{t.message}</span>
                        <button onClick={() => removeToast(t.id)} className="ml-4 hover:opacity-80">
                            <Icons.X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
