import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/apiClient';
import { useAuth } from '../../context/Auth/AuthContext';

interface MoneySource {
    id: number | string;
    name: string;
    balance: string;
    show_balance: boolean;
}

const TransactionForm = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [moneySources, setMoneySources] = useState<MoneySource[]>([]);

    const [formData, setFormData] = useState({
        type: searchParams.get('type') || 'credit', // 'credit' = Income, 'debit' = Expense, 'transfer' = Transfer
        amount: searchParams.get('amount') || '',
        date: new Date().toISOString().split('T')[0],
        money_source_id: '',
        to_money_source_id: '',
        category: searchParams.get('category') || '',
        description: searchParams.get('description') || '',
        pledge_id: searchParams.get('pledgeId') || ''
    });

    const [categories, setCategories] = useState<{ name: string, is_credit: boolean, is_debit: boolean, type?: string }[]>([]);

    useEffect(() => {
        // Fetch money sources
        api.get('/money-sources').then(res => {
            if (Array.isArray(res.data)) {
                setMoneySources(res.data);
                if (res.data.length > 0) {
                    setFormData(prev => ({ ...prev, money_source_id: String(res.data[0].id) }));
                }
            }
        });

        // Fetch categories
        api.get('/transaction-categories').then(res => {
            if (Array.isArray(res.data)) {
                setCategories(res.data);
            }
        });
    }, []);

    const isIncome = formData.type === 'credit';
    const isTransfer = formData.type === 'transfer';
    const selectedSource = moneySources.find(s => String(s.id) === String(formData.money_source_id));

    const balanceValidation = useMemo(() => {
        if (!selectedSource || isIncome) return null;

        const amount = parseFloat(formData.amount || "0");
        const balance = parseFloat(String(selectedSource.balance).replace(/,/g, ''));

        if (isNaN(amount) || isNaN(balance)) return null;

        const isSufficient = balance >= amount;

        return {
            isSufficient,
            message: isSufficient
                ? "Sufficient funds available"
                : "Insufficient funds in selected source"
        };
    }, [selectedSource, formData.amount, isIncome]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Block if insufficient funds
        if (balanceValidation && !balanceValidation.isSufficient) {
            alert("Cannot proceed: Insufficient funds.");
            return;
        }

        setLoading(true);
        try {
            await api.post('/transactions', formData);
            navigate(-1); // Go back to history
        } catch (error) {
            console.error(error);
            alert("Failed to save transaction");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-background-light dark:bg-background-dark min-h-screen p-4 flex items-start justify-center pt-10">
            <div className="w-full bg-white dark:bg-gray-900 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                {/* Header */}
                <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">arrow_back</span>
                        </button>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">New Transaction</h1>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">

                    {/* Type Selector (Tabs) */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'credit' })}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${isIncome
                                ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                            Income
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'debit' })}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${formData.type === 'debit'
                                ? 'bg-white dark:bg-gray-700 text-red-600 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                            Expense
                        </button>
                        {user?.role === 'admin' && (
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'transfer', category: 'transfer' })}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${isTransfer
                                    ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">sync_alt</span>
                                Transfer
                            </button>
                        )}
                    </div>


                    {/* Sources Selection */}
                    {isTransfer && (
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">From Source</span>
                                <div className="relative">
                                    <select
                                        value={formData.money_source_id}
                                        onChange={e => setFormData({ ...formData, money_source_id: e.target.value })}
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 appearance-none transition-all"
                                        required
                                    >
                                        <option value="" disabled>Select Source</option>
                                        {moneySources.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-3.5 pointer-events-none text-gray-500 text-sm">expand_more</span>
                                </div>
                                {selectedSource && selectedSource.show_balance && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium px-1">
                                        Bal: <span className="text-gray-800 dark:text-gray-200">₹{selectedSource.balance}</span>
                                    </span>
                                )}
                            </label>

                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">To Source</span>
                                <div className="relative">
                                    <select
                                        value={formData.to_money_source_id}
                                        onChange={e => setFormData({ ...formData, to_money_source_id: e.target.value })}
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 appearance-none transition-all"
                                        required
                                    >
                                        <option value="" disabled>Select Destination</option>
                                        {moneySources
                                            .filter(s => String(s.id) !== String(formData.money_source_id))
                                            .map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-3.5 pointer-events-none text-gray-500 text-sm">expand_more</span>
                                </div>
                            </label>
                        </div>
                    )}

                    {!isTransfer && (
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Paid Via</span>
                                <div className="relative">
                                    <select
                                        value={formData.money_source_id}
                                        onChange={e => setFormData({ ...formData, money_source_id: e.target.value })}
                                        className={`w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-1 appearance-none transition-all ${isIncome ? 'focus:border-primary focus:ring-primary' : 'focus:border-red-500 focus:ring-red-500'}`}
                                        required
                                    >
                                        <option value="" disabled>Select Source</option>
                                        {moneySources.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-3.5 pointer-events-none text-gray-500 text-sm">expand_more</span>
                                </div>
                                {selectedSource && selectedSource.show_balance && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium px-1">
                                        Bal: <span className="text-gray-800 dark:text-gray-200">₹{selectedSource.balance}</span>
                                    </span>
                                )}
                            </label>

                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Category</span>
                                <div className="relative">
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className={`w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-1 appearance-none transition-all ${isIncome ? 'focus:border-primary focus:ring-primary' : 'focus:border-red-500 focus:ring-red-500'}`}
                                        required
                                    >
                                        <option value="" disabled>Select Category</option>
                                        {categories
                                            .filter(c => (isIncome && c.is_credit) || (!isIncome && c.is_debit))
                                            .map((c, i) => (
                                                <option key={i} value={c.name}>{c.name}</option>
                                            ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-3.5 pointer-events-none text-gray-500 text-sm">expand_more</span>
                                </div>
                            </label>
                        </div>
                    )}

                    {/* Amount & Date Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Amount</span>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    className={`w-full h-12 pl-8 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-1 transition-all font-semibold ${isIncome ? 'focus:border-primary focus:ring-primary' : isTransfer ? 'focus:border-blue-500 focus:ring-blue-500' : 'focus:border-red-500 focus:ring-red-500'}`}
                                    placeholder="0.00"
                                    autoFocus
                                    required
                                />
                            </div>
                            {balanceValidation && (
                                <span className={`text-xs font-bold px-1 ${balanceValidation.isSufficient ? 'text-green-600' : 'text-red-600'}`}>
                                    {balanceValidation.message}
                                </span>
                            )}
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Date</span>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className={`w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-1 transition-all ${isIncome ? 'focus:border-primary focus:ring-primary' : isTransfer ? 'focus:border-blue-500 focus:ring-blue-500' : 'focus:border-red-500 focus:ring-red-500'}`}
                                required
                            />
                        </label>
                    </div>

                    {/* Description */}
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Description</span>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className={`w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-1 resize-none h-24 transition-all ${isIncome ? 'focus:border-primary focus:ring-primary' : isTransfer ? 'focus:border-blue-500 focus:ring-blue-500' : 'focus:border-red-500 focus:ring-red-500'}`}
                            placeholder="Add notes..."
                            required
                        ></textarea>
                    </label>

                    {/* Footer / Buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 px-6 py-3 rounded-xl font-bold transition-colors bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || (balanceValidation ? !balanceValidation.isSufficient : false)}
                            className={`flex-1 px-8 py-3 rounded-xl text-white font-bold shadow-lg shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${loading || (balanceValidation && !balanceValidation.isSufficient)
                                ? 'bg-gray-400 cursor-not-allowed opacity-70'
                                : 'bg-primary hover:bg-primary-dark'
                                }`}
                        >
                            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Save'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default TransactionForm;
