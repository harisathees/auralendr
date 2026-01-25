import { useState, useEffect } from 'react';
import api from '../../../api/apiClient';
import type { TransactionCategory as Category } from '../../../types/models';

interface TransactionCategoryFormProps {
    initialData: Category | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const TransactionCategoryForm: React.FC<TransactionCategoryFormProps> = ({ initialData, onSuccess, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [isCredit, setIsCredit] = useState(true); // Income
    const [isDebit, setIsDebit] = useState(false);  // Expense (Changed default to false for clarity)
    const [isActive, setIsActive] = useState(true);

    const isEdit = Boolean(initialData);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setIsCredit(!!initialData.is_credit);
            setIsDebit(!!initialData.is_debit);
            setIsActive(!!initialData.is_active);
        } else {
            setName('');
            setIsCredit(true);
            setIsDebit(false);
            setIsActive(true);
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isCredit && !isDebit) {
            alert('Please select at least one type (Income or Expense)');
            return;
        }

        setLoading(true);
        try {
            const payload = { name, is_credit: isCredit, is_debit: isDebit, is_active: isActive };
            if (isEdit && initialData) {
                await api.put(`/transaction-categories/${initialData.id}`, payload);
            } else {
                await api.post('/transaction-categories', payload);
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Failed to save category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[85vh]">
            <header className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 flex-shrink-0">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    {isEdit ? 'Edit Category' : 'New Transaction Category'}
                </h1>
                <div className="flex items-center gap-3">
                    <div
                        onClick={() => setIsActive(!isActive)}
                        className={`flex items-center gap-1.5 p-1 px-3 text-xs font-bold rounded-full transition-all cursor-pointer ${isActive
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[14px]">check</span>
                        {isActive ? 'Active' : 'Inactive'}
                    </div>
                    <button onClick={onCancel} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6 overflow-y-auto">
                <label className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Category Name</span>
                    <input
                        value={name} onChange={e => setName(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        placeholder="e.g. Office Rent, Salary, Bill Payment" required
                    />
                </label>

                <div className="flex flex-col gap-3">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Applicable For</span>
                    <div className="grid grid-cols-2 gap-3">
                        {/* Income / Credit Checkbox */}
                        <div
                            onClick={() => setIsCredit(!isCredit)}
                            className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer active:scale-95 ${isCredit
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400'
                                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 transition-colors ${isCredit ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                                }`}>
                                <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                            </div>
                            <span className={`text-sm font-bold uppercase tracking-wide ${isCredit ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                Income
                            </span>
                        </div>

                        {/* Expense / Debit Checkbox */}
                        <div
                            onClick={() => setIsDebit(!isDebit)}
                            className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer active:scale-95 ${isDebit
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-400'
                                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 transition-colors ${isDebit ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                                }`}>
                                <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                            </div>
                            <span className={`text-sm font-bold uppercase tracking-wide ${isDebit ? 'text-red-700 dark:text-red-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                Expense
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400">Select what type of transactions this category can be used for.</p>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 rounded-xl font-bold transition-colors text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : (isEdit ? 'Update Category' : 'Save Category')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TransactionCategoryForm;
