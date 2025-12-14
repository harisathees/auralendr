import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDangerous?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isDangerous = false,
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all scale-100">
                <div className="p-6 flex flex-col items-center text-center gap-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isDangerous ? 'bg-red-100 text-red-500 dark:bg-red-900/30' : 'bg-primary/10 text-primary'}`}>
                        <span className="material-symbols-outlined text-2xl">
                            {isDangerous ? 'warning' : 'info'}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-primary-text dark:text-white leading-tight">
                            {title}
                        </h3>
                        <p className="text-sm text-secondary-text dark:text-gray-400">
                            {message}
                        </p>
                    </div>
                </div>

                <div className="flex border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <div className="w-px bg-gray-100 dark:bg-gray-700"></div>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-3 text-sm font-bold transition-colors ${isDangerous
                                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                : 'text-primary hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
