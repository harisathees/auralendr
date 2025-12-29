import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/apiClient';
import { useAuth } from '../../context/Auth/AuthContext';
import { useReactToPrint } from 'react-to-print';
import StatementTemplate from './components/StatementTemplate';

import type { Transaction } from '../../types/models';

const TransactionHistory = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // Filtering State
    const [moneySources, setMoneySources] = useState<{ id: number, name: string, balance: number, show_balance: boolean, type: string }[]>([]);
    const [selectedSourceId, setSelectedSourceId] = useState<string>('');
    const [isFilterOpen, setIsFilterOpen] = useState(false); // For source dropdown toggle

    // Branch Filter State
    const [branches, setBranches] = useState<{ id: number, branch_name: string }[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [isBranchFilterOpen, setIsBranchFilterOpen] = useState(false);

    // Date Filter State
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);

    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [reportData, setReportData] = useState<{ opening_balance: number, transactions: Transaction[] } | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const statementRef = useRef<any>(null);

    const handlePrint = useReactToPrint({
        contentRef: statementRef,
        documentTitle: `Statement_${new Date().toISOString().split('T')[0]}`,
    });

    const generateStatement = async () => {
        setIsGeneratingReport(true);
        try {
            const params = new URLSearchParams();
            if (selectedSourceId) params.append('money_source_id', selectedSourceId);
            if (selectedBranchId) params.append('branch_id', selectedBranchId);
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);

            const res = await api.get(`/transactions/report?${params.toString()}`);
            setReportData(res.data);

            // Give it a moment to render the template
            setTimeout(() => {
                handlePrint();
                setIsGeneratingReport(false);
            }, 500);
        } catch (error) {
            console.error("Failed to generate report", error);
            setIsGeneratingReport(false);
        }
    };

    useEffect(() => {
        fetchMoneySources(selectedBranchId);
        if (user?.role === 'admin') {
            fetchBranches();
        }
    }, [selectedBranchId, user?.role]);

    useEffect(() => {
        fetchTransactions();
    }, [selectedSourceId, selectedBranchId, startDate, endDate]); // Refetch on filter change

    const fetchMoneySources = async (branchId?: string) => {
        try {
            const url = branchId ? `/money-sources?branch_id=${branchId}` : '/money-sources';
            const res = await api.get(url);
            setMoneySources(res.data);
        } catch (error) {
            console.error('Failed to fetch money sources');
        }
    };

    const fetchBranches = async () => {
        try {
            const res = await api.get('/branches');
            setBranches(res.data);
        } catch (error) {
            console.error('Failed to fetch branches');
        }
    };

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            let url = '/transactions?';
            if (selectedSourceId) url += `money_source_id=${selectedSourceId}&`;
            if (selectedBranchId) url += `branch_id=${selectedBranchId}&`;
            if (startDate) url += `start_date=${startDate}&`;
            if (endDate) url += `end_date=${endDate}&`;

            const response = await api.get(url);
            setTransactions(response.data.data);
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDateHeader = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

        return date.toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const groupedTransactions = transactions.reduce((groups, transaction) => {
        const dateKey = new Date(transaction.date).toDateString();
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(transaction);
        return groups;
    }, {} as Record<string, Transaction[]>);

    return (
        <div className="fixed inset-0 bottom-[76px] flex flex-col bg-background-light dark:bg-background-dark overflow-hidden font-display max-w-5xl mx-auto">
            {/* Sticky Header Group */}
            <div className="flex-none bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-40">
                <header className="px-4 pt-6 pb-2 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-700 dark:text-gray-200">arrow_back_ios_new</span>
                    </button>
                    <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Transaction History</h1>
                    <button
                        className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary active:scale-95 transition-all px-3 py-1.5 rounded-full"
                        onClick={() => navigate('/transactions/create')}
                    >
                        <span className="text-xs font-black uppercase tracking-wide">Add</span>
                        <span className="material-symbols-outlined text-lg">post_add</span>
                    </button>
                </header>

                {/* Filter Bar */}
                <div className="px-4 py-3 flex flex-wrap items-center gap-3">
                    {/* Money Source Filter */}
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap active:scale-95 transition-all ${selectedSourceId
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700'
                                }`}
                        >
                            {selectedSourceId
                                ? moneySources.find(s => s.id.toString() === selectedSourceId)?.name
                                : 'All Sources'}
                            <span className="material-symbols-outlined text-base ml-1">expand_more</span>
                        </button>

                        {isFilterOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)}></div>
                                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={() => { setSelectedSourceId(''); setIsFilterOpen(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedSourceId === '' ? 'text-primary bg-primary/5' : 'text-gray-700 dark:text-gray-200'}`}
                                    >
                                        All Sources
                                    </button>
                                    {moneySources.map(source => (
                                        <button
                                            key={source.id}
                                            onClick={() => { setSelectedSourceId(source.id.toString()); setIsFilterOpen(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedSourceId === source.id.toString() ? 'text-primary bg-primary/5' : 'text-gray-700 dark:text-gray-200'}`}
                                        >
                                            {source.name}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Branch Filter */}
                    {user?.role === 'admin' && (
                        <div className="relative">
                            <button
                                onClick={() => setIsBranchFilterOpen(!isBranchFilterOpen)}
                                className={`flex items-center px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap active:scale-95 transition-all ${selectedBranchId
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700'
                                    }`}
                            >
                                {selectedBranchId
                                    ? branches.find(s => s.id.toString() === selectedBranchId)?.branch_name
                                    : 'All Branches'}
                                <span className="material-symbols-outlined text-base ml-1">expand_more</span>
                            </button>

                            {isBranchFilterOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsBranchFilterOpen(false)}></div>
                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <button
                                            onClick={() => { setSelectedBranchId(''); setIsBranchFilterOpen(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedBranchId === '' ? 'text-primary bg-primary/5' : 'text-gray-700 dark:text-gray-200'}`}
                                        >
                                            All Branches
                                        </button>
                                        {branches.map(branch => (
                                            <button
                                                key={branch.id}
                                                onClick={() => { setSelectedBranchId(branch.id.toString()); setIsBranchFilterOpen(false); }}
                                                className={`w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedBranchId === branch.id.toString() ? 'text-primary bg-primary/5' : 'text-gray-700 dark:text-gray-200'}`}
                                            >
                                                {branch.branch_name}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Date Filter */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                            className={`flex items-center px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap active:scale-95 transition-all ${startDate || endDate
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700'
                                }`}
                        >
                            {startDate || endDate ? 'Filtered' : 'Date'}
                            <span className="material-symbols-outlined text-base ml-1">calendar_today</span>
                        </button>

                        {isDateFilterOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsDateFilterOpen(false)}></div>
                                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 p-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Start Date</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-primary font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">End Date</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-primary font-bold"
                                        />
                                    </div>
                                    <button
                                        onClick={() => { setStartDate(''); setEndDate(''); setIsDateFilterOpen(false); }}
                                        className="w-full py-2 text-xs font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30 uppercase tracking-widest"
                                    >
                                        Clear Filter
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Statement Button */}
                    <button
                        onClick={generateStatement}
                        disabled={isGeneratingReport}
                        className="h-10 px-4 rounded-full bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isGeneratingReport ? (
                            <>
                                <span className="w-3 h-3 border-2 border-white/30 border-t-white dark:border-gray-900/30 dark:border-t-gray-900 rounded-full animate-spin"></span>
                                Wait...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                                Statement
                            </>
                        )}
                    </button>
                </div>

                {/* Money Source Balances Carousel */}
                <div className="px-4 py-3 overflow-x-auto no-scrollbar flex gap-3">
                    {moneySources.filter(s => s.show_balance).map(source => (
                        <div
                            key={source.id}
                            className={`flex-none min-w-[140px] p-3 rounded-2xl border transition-all cursor-pointer active:scale-95 ${selectedSourceId === source.id.toString()
                                ? 'bg-primary border-primary shadow-lg shadow-primary/20 text-white'
                                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white'
                                }`}
                            onClick={() => setSelectedSourceId(selectedSourceId === source.id.toString() ? '' : source.id.toString())}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`material-symbols-outlined text-lg ${selectedSourceId === source.id.toString() ? 'text-white' : 'text-primary'}`}>
                                    {source.type === 'cash' ? 'payments' : source.type === 'bank' ? 'account_balance' : 'account_balance_wallet'}
                                </span>
                                <span className={`text-[10px] font-black uppercase tracking-wider ${selectedSourceId === source.id.toString() ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {source.name}
                                </span>
                            </div>
                            <div className="text-sm font-black">
                                ₹{Number(source.balance).toLocaleString('en-IN')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <main className="flex-1 min-h-0 px-4 pt-4 overflow-y-auto no-scrollbar">
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
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.category === 'loan' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                                                item.category === 'repledge' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                                                    item.category === 'transfer' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                                                        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                <span className="material-symbols-outlined">
                                                    {item.category === 'loan' ? 'local_offer' :
                                                        item.category === 'repledge' ? 'autorenew' :
                                                            item.category === 'transfer' ? 'sync_alt' : 'receipt_long'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate pr-2">
                                                    {item.description}
                                                </h3>
                                                <span className={`text-sm font-bold whitespace-nowrap ${item.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
                                                    }`}>
                                                    {item.type === 'credit' ? '+' : ''} ₹{Number(item.amount).toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
                                                <span className="material-symbols-outlined text-sm mr-1">account_balance_wallet</span>
                                                <span className="truncate">{item.money_source?.name || 'Unknown Source'}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs font-medium text-gray-700 dark:text-gray-300">
                                                <div className="flex items-center">
                                                    <span className={`font-black italic mr-2 text-[10px] tracking-wider uppercase ${item.category === 'loan' ? 'text-purple-700 dark:text-purple-400' :
                                                        item.category === 'repledge' ? 'text-blue-700 dark:text-blue-400' :
                                                            item.category === 'transfer' ? 'text-amber-700 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'
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
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                                <span className="material-symbols-outlined text-[12px]">person</span>
                                                <span>{item.creator?.name || 'System'}</span>
                                            </div>
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

            {/* Hidden Statement Template for Printing */}
            <div className="hidden">
                {reportData && (
                    <StatementTemplate
                        ref={statementRef}
                        transactions={reportData.transactions}
                        openingBalance={reportData.opening_balance}
                        startDate={startDate}
                        endDate={endDate}
                        moneySource={moneySources.find(s => s.id.toString() === selectedSourceId)?.name || (selectedSourceId ? 'Filtered' : 'All Sources')}
                        branch={branches.find(b => b.id.toString() === selectedBranchId)?.branch_name}
                    />
                )}
            </div>
        </div>
    );
};

export default TransactionHistory;
