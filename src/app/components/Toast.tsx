import React, { useEffect } from 'react';

interface ToastProps {
    message: string;
    error?: boolean;
    duration?: number; // ms, optional auto-dismiss
    onClose?: () => void;
    className?: string;
}

const Toast: React.FC<ToastProps> = ({
    message,
    error = false,
    duration = 3000,
    onClose,
    className = '',
}) => {
    useEffect(() => {
        if (!onClose || duration === 0) return;
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div
            role="alert"
            aria-live="assertive"
            className={`p-4 rounded-lg shadow-md flex items-center justify-between gap-2 ${error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} w-full max-w-md ${className}`}
        >
            <p className="text-gray-600 flex-1">{message}</p>
            {onClose && (
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="ml-2 text-xl font-bold text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                    &times;
                </button>
            )}
        </div>
    );
};

export default Toast;