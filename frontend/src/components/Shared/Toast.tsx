import React, { useEffect, useState } from 'react';
import { Check, AlertCircle, Info, X } from "lucide-react";

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose, duration = 3000 }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const handleClose = () => {
        setIsExiting(true);
        // Wait for animation to finish before calling onClose
        setTimeout(() => {
            onClose();
        }, 150);
    };

    return (
        <div className={`fixed bottom-24 right-6 z-[100] transition-all duration-150 ease-in-out ${isExiting
            ? 'animate-out slide-out-to-bottom-5 fade-out'
            : 'animate-in slide-in-from-bottom-5 fade-in'
            }`}>
            <div className="flex items-center gap-4 bg-[#1A1C1E] text-white px-5 py-4 rounded-2xl shadow-2xl border border-gray-800 min-w-[320px] max-w-sm">

                {/* Icon Circle */}
                <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${type === 'success' ? 'bg-[#00E05E] text-black' : (type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white')}`}>
                    {type === 'success' ? <Check className="w-5 h-5 font-bold" strokeWidth={3} /> : (type === 'error' ? <AlertCircle className="w-5 h-5 font-bold" strokeWidth={3} /> : <Info className="w-5 h-5 font-bold" strokeWidth={3} />)}
                </div>

                {/* Text */}
                <div className="flex-1">
                    <p className="text-[15px] font-medium leading-snug">{message}</p>
                </div>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="shrink-0 text-gray-400 hover:text-white transition-colors -mr-1"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
