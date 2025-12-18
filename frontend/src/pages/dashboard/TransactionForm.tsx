import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../../api/http';

interface MoneySource {
    id: number;
    name: string;
    balance: string;
}

const TransactionForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [moneySources, setMoneySources] = useState<MoneySource[]>([]);

    const [formData, setFormData] = useState({
        type: 'credit', // 'credit' = Income, 'debit' = Expense
        amount: '',
        date: new Date().toISOString().split('T')[0],
        money_source_id: '',
        category: '',
        description: ''
    });

    const [categories, setCategories] = useState<{ name: string, is_credit: boolean, is_debit: boolean }[]>([]);

    useEffect(() => {
        // Fetch money sources
        http.get('/money-sources').then(res => {
            if (Array.isArray(res.data)) {
                setMoneySources(res.data);
                if (res.data.length > 0) {
                    setFormData(prev => ({ ...prev, money_source_id: res.data[0].id }));
                }
            }
        });

        // Fetch categories
        http.get('/transaction-categories').then(res => {
            if (Array.isArray(res.data)) {
                setCategories(res.data);
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await http.post('/transactions', formData);
            navigate(-1); // Go back to history
        } catch (error) {
            console.error(error);
            alert("Failed to save transaction");
        } finally {
            setLoading(false);
        }
    };

    const isIncome = formData.type === 'credit';

    return (
        <div className="max-w-md mx-auto min-h-screen bg-background-light dark:bg-background-dark pb-10">
            <header className="px-4 pt-6 pb-2 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <span className="material-symbols-outlined text-gray-700 dark:text-gray-200">arrow_back_ios_new</span>
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">New Transaction</h1>
            </header>

            <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-6">

                {/* Type Toggle */}
                <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex">
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'credit' })}
                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${isIncome
                            ? 'bg-green-500 text-white shadow-md'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">arrow_downward</span>
                        Income
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'debit' })}
                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${!isIncome
                            ? 'bg-red-500 text-white shadow-md'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">arrow_upward</span>
                        Expense
                    </button>
                </div>

                {/* Amount */}
                <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</span>
                    <div className={`flex items-center px-4 rounded-xl border-2 transition-colors ${isIncome
                        ? 'border-green-100 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10 focus-within:border-green-500'
                        : 'border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 focus-within:border-red-500'
                        }`}>
                        <span className={`text-xl font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>₹</span>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            className={`w-full h-14 bg-transparent outline-none text-2xl font-bold px-2 ${isIncome ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}
                            placeholder="0"
                            autoFocus
                            required
                        />
                    </div>
                </label>

                {/* Date */}
                <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</span>
                    <input
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        required
                    />
                </label>

                {/* Money Source */}
                <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Wallet / Account</span>
                    <div className="relative">
                        <select
                            value={formData.money_source_id}
                            onChange={e => setFormData({ ...formData, money_source_id: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
                            required
                        >
                            <option value="" disabled>Select Source</option>
                            {moneySources.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.name} (₹{s.balance})
                                </option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-3.5 pointer-events-none text-gray-500">expand_more</span>
                    </div>
                </label>

                {/* Category */}
                <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</span>
                    <div className="relative">
                        <select
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
                            required
                        >
                            <option value="" disabled>Select Category</option>
                            {categories
                                .filter(c => c.type === 'both' || c.type === (isIncome ? 'credit' : 'debit'))
                                .map((c, i) => (
                                    <option key={i} value={c.name}>{c.name}</option>
                                ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-3.5 pointer-events-none text-gray-500">expand_more</span>
                    </div>
                </label>

                {/* Description */}
                <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</span>
                    <textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none h-24"
                        placeholder="What is this for?"
                        required
                    ></textarea>
                </label>

                <button
                    type="submit"
                    disabled={loading}
                    className={`mt-4 w-full h-14 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all text-lg flex items-center justify-center gap-2 ${isIncome
                        ? 'bg-green-600 hover:bg-green-700 shadow-green-200 dark:shadow-none'
                        : 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {loading ? (
                        <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">check</span>
                            Save Transaction
                        </>
                    )}
                </button>

            </form>
        </div>
    );
};

export default TransactionForm;
