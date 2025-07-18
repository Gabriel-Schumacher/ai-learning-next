"use client";
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import Toast from './Toast';

type ToastState = { message: string; error?: boolean } | null;

interface ToastContextType {
    showToast: (message: string, error?: boolean) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within a ToastProvider');
    return ctx;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toast, setToast] = useState<ToastState>(null);

    const showToast = useCallback((message: string, error: boolean = false) => {
        setToast({ message, error });
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                    <Toast
                        message={toast.message}
                        error={toast.error}
                        onClose={() => setToast(null)}
                    />
                </div>
            )}
        </ToastContext.Provider>
    );
};
