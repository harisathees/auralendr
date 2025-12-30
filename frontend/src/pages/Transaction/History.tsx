import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/apiClient';

import type { Transaction } from '../../types/models';

const TransactionHistory = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // Filtering State
    const [moneySources, setMoneySources] = useState<{ id: number, name: string }[]>([]);
    const [selectedSourceId, setSelectedSourceId] = useState<string>('');
    const [isFilterOpen, setIsFilterOpen] = useState(false); // For source dropdown toggle

    // Branch Filter State
    const [branches, setBranches] = useState<{ id: number, branch_name: string }[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [isBranchFilterOpen, setIsBranchFilterOpen] = useState(false);

    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        fetchMoneySources();
        fetchBranches();
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [selectedSourceId, selectedBranchId]); // Refetch on filter change

    const fetchMoneySources = async () => {
        try {
            const res = await api.get('/api/money-sources');
            setMoneySources(res.data);
        } catch (error) {
            console.error('Failed to fetch money sources');
        }
    };

    const fetchBranches = async () => {
        try {
            const res = await api.get('/api/branches');
            setBranches(res.data);
        } catch (error) {
            console.error('Failed to fetch branches');
        }
    };

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            // Append query param if source is selected
            let url = '/api/transactions?';
            if (selectedSourceId) url += `money_source_id=${selectedSourceId}&`;
            if (selectedBranchId) url += `branch_id=${selectedBranchId}&`;

            const response = await api.get(url);
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
        <div className="max-w-md mx-auto h-full flex flex-col overflow-hidden bg-background-light dark:bg-background-dark">
            <header className="flex-none bg-background-light dark:bg-background-dark px-4 pt-6 pb-2 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 z-20">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-gray-700 dark:text-gray-200">arrow_back_ios_new</span>
                </button>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h1>
                <button
                    className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary active:scale-95 transition-all px-3 py-1.5 rounded-full"
                    onClick={() => navigate('/transactions/create')}
                >
                    <span className="text-xs font-bold uppercase tracking-wide">Add</span>
                    <span className="material-symbols-outlined text-lg">post_add</span>
                </button>
            </header>

            {/* Filter Bar */}
            <div className="flex-none bg-background-light dark:bg-background-dark px-4 py-3 flex flex-wrap gap-3 border-b border-gray-100 dark:border-gray-800 z-10">

                {/* Money Source Filter */}
                <div className="relative">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap active:scale-95 transition-all ${selectedSourceId
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : 'bg-card-light dark:bg-card-dark text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                            }`}
                    >
                        {selectedSourceId
                            ? moneySources.find(s => s.id.toString() === selectedSourceId)?.name
                            : 'All Sources'}
                        <span className="material-symbols-outlined text-base ml-1">expand_more</span>
                    </button>

                    {/* Filter Dropdown */}
                    {isFilterOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)}></div>
                            <div className="absolute top-full mt-2 left-0 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    onClick={() => { setSelectedSourceId(''); setIsFilterOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedSourceId === '' ? 'text-primary bg-primary/5' : 'text-gray-700 dark:text-gray-200'}`}
                                >
                                    All Sources
                                </button>
                                {moneySources.map(source => (
                                    <button
                                        key={source.id}
                                        onClick={() => { setSelectedSourceId(source.id.toString()); setIsFilterOpen(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedSourceId === source.id.toString() ? 'text-primary bg-primary/5' : 'text-gray-700 dark:text-gray-200'}`}
                                    >
                                        {source.name}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Branch Filter */}
                <div className="relative">
                    <button
                        onClick={() => setIsBranchFilterOpen(!isBranchFilterOpen)}
                        className={`flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap active:scale-95 transition-all ${selectedBranchId
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                            : 'bg-card-light dark:bg-card-dark text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                            }`}
                    >
                        {selectedBranchId
                            ? branches.find(s => s.id.toString() === selectedBranchId)?.branch_name
                            : 'All Branches'}
                        <span className="material-symbols-outlined text-base ml-1">expand_more</span>
                    </button>

                    {/* Filter Dropdown */}
                    {isBranchFilterOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsBranchFilterOpen(false)}></div>
                            <div className="absolute top-full mt-2 left-0 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    onClick={() => { setSelectedBranchId(''); setIsBranchFilterOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedBranchId === '' ? 'text-primary bg-primary/5' : 'text-gray-700 dark:text-gray-200'}`}
                                >
                                    All Branches
                                </button>
                                {branches.map(branch => (
                                    <button
                                        key={branch.id}
                                        onClick={() => { setSelectedBranchId(branch.id.toString()); setIsBranchFilterOpen(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedBranchId === branch.id.toString() ? 'text-primary bg-primary/5' : 'text-gray-700 dark:text-gray-200'}`}
                                    >
                                        {branch.branch_name}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <button className="flex items-center bg-card-light dark:bg-card-dark px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap active:scale-95 transition-transform border border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed">
                    Date
                    <span className="material-symbols-outlined text-base ml-1 text-gray-500 dark:text-gray-400">expand_more</span>
                </button>
                <button className="flex items-center bg-card-light dark:bg-card-dark px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap active:scale-95 transition-transform border border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed">
                    Category
                    <span className="material-symbols-outlined text-base ml-1 text-gray-500 dark:text-gray-400">expand_more</span>
                </button>
            </div>

            <main className="flex-1 px-4 pt-4 overflow-y-auto no-scrollbar">
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
                                <div key={item.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors -mx-2 px-2">
                                    <div
                                        className="flex items-start py-4 cursor-pointer"
                                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                    >
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
                                            <div className="flex items-center justify-between text-xs font-medium text-gray-700 dark:text-gray-300">
                                                <div className="flex items-center">
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
                                    </div>

                                    {/* Expanded Details */}
                                    <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${expandedId === item.id ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="flex items-center gap-2 pl-[4.5rem] pr-4 pb-4">
                                            {/* Created By Pill */}
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                                <span className="material-symbols-outlined text-[12px]">person</span>
                                                <span>{item.creator?.name || 'System'}</span>
                                            </div>

                                            {/* Branch Pill */}
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                                <span className="material-symbols-outlined text-[12px]">store</span>
                                                <span>{item.creator?.branch?.branch_name || 'Main Office'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                )}
                <div className="h-32"></div>
            </main>
        </div>
    );
};

export default TransactionHistory;
