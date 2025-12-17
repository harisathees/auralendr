import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../../api/http';

interface Transaction {
    id: number;
    type: 'credit' | 'debit';
    amount: string;
    date: string;
    description: string;
    category: string;
    money_source: {
        name: string;
        type: string;
    };
    created_at: string;
}

const TransactionHistory = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await http.get('/transactions');
            setTransactions(response.data.data);
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to format date header
    const formatDateHeader = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        }
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        return date.toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Group transactions by date
    const groupedTransactions = transactions.reduce((groups, transaction) => {
        const dateKey = new Date(transaction.date).toDateString(); // Use exact date string for grouping key
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(transaction);
        return groups;
    }, {} as Record<string, Transaction[]>);

    return (
        <div className="max-w-md mx-auto min-h-screen relative flex flex-col pb-24 bg-background-light dark:bg-background-dark">
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 pt-6 pb-2 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-gray-700 dark:text-gray-200">arrow_back_ios_new</span>
                </button>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h1>
                <button
                    className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary active:scale-95 transition-all px-3 py-1.5 rounded-full"
                    onClick={() => console.log("Add Transaction")}
                >
                    <span className="text-xs font-bold uppercase tracking-wide">Add</span>
                    <span className="material-symbols-outlined text-lg">post_add</span>
                </button>
            </header>

            <div className="sticky top-[69px] z-10 bg-background-light dark:bg-background-dark px-4 py-3 flex space-x-3 overflow-x-auto no-scrollbar border-b border-gray-100 dark:border-gray-800">
                <button className="flex items-center bg-card-light dark:bg-card-dark px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap active:scale-95 transition-transform">
                    Date
                    <span className="material-symbols-outlined text-base ml-1 text-gray-500 dark:text-gray-400">expand_more</span>
                </button>
                <button className="flex items-center bg-card-light dark:bg-card-dark px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap active:scale-95 transition-transform">
                    Services
                    <span className="material-symbols-outlined text-base ml-1 text-gray-500 dark:text-gray-400">expand_more</span>
                </button>
                <button className="flex items-center bg-card-light dark:bg-card-dark px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap active:scale-95 transition-transform">
                    Method
                    <span className="material-symbols-outlined text-base ml-1 text-gray-500 dark:text-gray-400">expand_more</span>
                </button>
            </div>

            <main className="flex-1 px-4 pt-4">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : Object.keys(groupedTransactions).length === 0 ? (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        No transactions found.
                    </div>
                ) : (
                    Object.entries(groupedTransactions).map(([dateKey, items]) => (
                        <div key={dateKey} className="mb-6">
                            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">{formatDateHeader(dateKey)}</h2>
                            {items.map((item) => (
                                <div key={item.id} className="flex items-start py-4 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors -mx-2 px-2">
                                    <div className="flex-shrink-0 mr-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                            // Matching the purple-50 aesthetic from static
                                            item.category === 'loan' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                                                item.category === 'repledge' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                                                    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                            }`}>
                                            <span className="material-symbols-outlined">
                                                {item.category === 'loan' ? 'local_offer' :
                                                    item.category === 'repledge' ? 'autorenew' : 'receipt_long'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate pr-2">
                                                {item.description}
                                            </h3>
                                            <span className={`text-sm font-bold whitespace-nowrap ${
                                                // Using simple text colors like static, green for + is good, maybe red or black for debit
                                                item.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
                                                }`}>
                                                {/* Format: Rp80.900 or ₹80,900 */}
                                                {item.type === 'credit' ? '+' : ''} ₹{Number(item.amount).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
                                            <span className="material-symbols-outlined text-sm mr-1">account_balance_wallet</span>
                                            <span className="truncate">{item.money_source?.name || 'Unknown Source'}</span>
                                        </div>
                                        <div className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300">
                                            {/* Badge style mimicking "VISA" */}
                                            <span className={`font-black italic mr-2 text-[10px] tracking-wider uppercase ${item.category === 'loan' ? 'text-purple-700 dark:text-purple-400' :
                                                    item.category === 'repledge' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                                                }`}>
                                                {item.category}
                                            </span>
                                            <span className="text-gray-400 text-[10px]">
                                                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                )}
                <div className="h-8"></div>
            </main>
        </div>
    );
};

export default TransactionHistory;
