import React, { useState, useEffect } from "react";
import api from "../../../api/apiClient";
import { useNavigate } from "react-router-dom";
import GoldCoinSpinner from "../../../components/Shared/LoadingGoldCoinSpinner/GoldCoinSpinner";
import { useRepledge } from "../../../hooks/useRepledge";

interface Loan {
    id: number;
    pledge_id: number;
    loan_no: string;
    amount: number;
    status: string;
    created_at: string;
    pledge: {
        customer: {
            name: string;
            mobile_no: string;
        };
        branch: {
            branch_name: string;
        };
        user: {
            name: string;
        };
    };
}

const LoanAccordionCard: React.FC<{ loan: Loan }> = ({ loan }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    // Helpers to match app theme
    const getStatusColor = (status: string) => {
        if (status === 'closed') return 'text-red-500 bg-red-100 dark:bg-red-500/20 border-red-200 dark:border-red-500/30';
        return 'text-primary bg-green-50 dark:bg-primary/20 border-green-100 dark:border-primary/30';
    };

    const handleProfileClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/admin/pledges/${loan.pledge_id}`);
    };

    return (
        <div className="border-b border-gray-100 dark:border-[#1f3d2e] bg-white dark:bg-[#162b20] first:rounded-t-xl last:rounded-b-xl overflow-hidden transition-colors duration-300">
            {/* Header (Always Visible) */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
                {/* Avatar Placeholder */}
                <div
                    onClick={handleProfileClick}
                    className="flex-shrink-0 relative cursor-pointer hover:opacity-80 transition-opacity"
                    title="View Pledge Details"
                >
                    <img
                        alt={loan.pledge?.customer?.name}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-white dark:ring-[#1f3d2e] shadow-sm dark:shadow-none bg-gray-200"
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(loan.pledge?.customer?.name || 'Unknown')}&background=random&color=fff&bold=true`}
                    />
                </div>

                {/* Main Summary */}
                <div className="flex-1 min-w-0 flex flex-col justify-between gap-1">
                    <div className="flex justify-between items-start">
                        <h3 className="text-base font-medium text-primary-text dark:text-white truncate">
                            {loan.pledge?.customer?.name || 'Unknown'}
                        </h3>
                        {/* Status Icon */}
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center border ${getStatusColor(loan.status)}`}>
                            <span className={`text-[10px] font-bold ${loan.status === 'closed' ? 'text-red-500' : 'text-primary'}`}>
                                {loan.status ? loan.status.charAt(0).toUpperCase() : 'A'}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-between items-end mt-1">
                        <p className="text-xs text-secondary-text dark:text-text-muted">
                            Loan No. <span className="text-primary-text dark:text-gray-400 font-medium">{loan.loan_no}</span>
                        </p>
                        <p className="text-sm font-semibold text-primary">
                            ₹{Number(loan.amount).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Chevron Icon */}
                <span className={`material-symbols-outlined text-gray-400 dark:text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </div>

            {/* Expanded Content (Accordion Body) */}
            <div
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
                <div className="overflow-hidden">
                    <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-[#1f3d2e] mt-2">
                        <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-4">
                            {/* Mobile */}
                            <div>
                                <span className="text-[10px] font-medium text-secondary-text uppercase tracking-wider block mb-1">Mobile</span>
                                <p className="text-sm text-primary-text dark:text-gray-300 font-medium">{loan.pledge?.customer?.mobile_no}</p>
                            </div>

                            {/* Date */}
                            <div>
                                <span className="text-[10px] font-medium text-secondary-text uppercase tracking-wider block mb-1">Date</span>
                                <p className="text-sm text-primary-text dark:text-gray-300 font-medium">
                                    {new Date(loan.created_at).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Branch */}
                            <div>
                                <span className="text-[10px] font-medium text-secondary-text uppercase tracking-wider block mb-1">Branch</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-secondary-text text-[14px]">store</span>
                                    <p className="text-sm text-primary-text dark:text-gray-300 font-medium">
                                        {loan.pledge?.branch?.branch_name || 'Main'}
                                    </p>
                                </div>
                            </div>

                            {/* Staff */}
                            <div>
                                <span className="text-[10px] font-medium text-secondary-text uppercase tracking-wider block mb-1">Created By</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-secondary-text text-[14px]">person</span>
                                    <p className="text-sm text-primary-text dark:text-gray-300 font-medium">
                                        {loan.pledge?.user?.name || 'Admin'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LoansList: React.FC = () => {
    const navigate = useNavigate();
    // Tab State
    const [activeTab, setActiveTab] = useState<'loans' | 'repledges'>('loans');

    // Loans State
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loadingLoans, setLoadingLoans] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const isFirstSearch = React.useRef(true);

    // Repledge State (from hook)
    const { repledgeEntries, fetchRepledgeEntries, loading: repledgeLoading } = useRepledge();

    // 1. Fetch Loans on Mount (if tab is loans), Page Change, or Status Change
    useEffect(() => {
        if (activeTab === 'loans') {
            fetchLoans();
        }
    }, [page, statusFilter, activeTab]);

    // 2. Fetch Repledges when tab changes
    useEffect(() => {
        if (activeTab === 'repledges') {
            fetchRepledgeEntries();
        }
    }, [activeTab, fetchRepledgeEntries]);

    // 3. Fetch on Search Change (Debounced) for Loans
    useEffect(() => {
        if (activeTab !== 'loans') return;

        // Skip the initial run because the first useEffect above already handles the initial fetch (with empty search term)
        if (isFirstSearch.current) {
            isFirstSearch.current = false;
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            fetchLoans();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Ref to store the latest abort controller
    const abortControllerRef = React.useRef<AbortController | null>(null);

    const fetchLoans = async () => {
        // Cancel previous request if it exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new controller
        const newController = new AbortController();
        abortControllerRef.current = newController;

        setLoadingLoans(true);
        try {
            const response = await api.get(
                `/api/admin-all-loans`,
                {
                    params: { page, search: searchTerm, status: statusFilter },
                    signal: newController.signal // Attach signal
                }
            );
            setLoans(response.data.data);
            setTotalPages(response.data.last_page);
        } catch (error: any) {
            // Ignore abort errors
            if (error.name === 'CanceledError') {
                return;
            }
            console.error("Error fetching loans:", error);
        } finally {
            // Only turn off loading if this is the active request (not aborted)
            if (newController.signal.aborted === false) {
                setLoadingLoans(false);
            }
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-primary-text dark:text-text-main font-display flex flex-col pb-safe">
            {/* Header */}
            <header className="flex-none pt-12 pb-4 px-5 bg-background-light dark:bg-background-dark z-10 sticky top-0">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold tracking-tight text-primary-text dark:text-white">
                        {activeTab === 'loans' ? 'All Loans' : 'Repledges'}
                    </h1>
                    <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-[#1f3d2e] px-3 py-1.5 rounded-full flex items-center shadow-sm dark:shadow-none">
                        <span className="text-primary text-xs font-bold uppercase tracking-wider">
                            {activeTab === 'loans' ? loans.length : repledgeEntries.length} Visible
                        </span>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-2 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('loans')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'loans'
                            ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                            }`}
                    >
                        Loans
                    </button>
                    <button
                        onClick={() => setActiveTab('repledges')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'repledges'
                            ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                            }`}
                    >
                        Repledges
                    </button>
                </div>


                {/* Search & Filter - Only for Loans for now */}
                {activeTab === 'loans' && (
                    <div className="flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="relative flex-1 group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <span className="material-symbols-outlined text-secondary-text dark:text-text-muted">search</span>
                            </div>
                            <input
                                className="block w-full p-3 pl-11 text-sm text-primary-text dark:text-white bg-white dark:bg-dark-surface border border-gray-200 dark:border-transparent rounded-xl placeholder-secondary-text dark:placeholder-text-muted focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm outline-none"
                                placeholder="Search..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative w-1/3">
                            <select
                                className="block w-full p-3 text-sm text-primary-text dark:text-white bg-white dark:bg-dark-surface border border-gray-200 dark:border-transparent rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm outline-none appearance-none"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">Status: All</option>
                                <option value="active">Active</option>
                                <option value="closed">Closed</option>
                                <option value="auctioned">Auctioned</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <span className="material-symbols-outlined text-secondary-text text-sm">filter_list</span>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* List Content */}
            <main className="flex-1 px-5 pb-24 overflow-y-auto no-scrollbar">
                {activeTab === 'loans' ? (
                    <>
                        {loadingLoans ? (
                            <div className="flex justify-center p-12">
                                <GoldCoinSpinner />
                            </div>
                        ) : loans.length > 0 ? (
                            <div className="space-y-0 divide-y divide-gray-100 dark:divide-[#1f3d2e] rounded-xl shadow-sm dark:shadow-none animate-in fade-in duration-500">
                                {loans.map((loan) => (
                                    <LoanAccordionCard key={loan.id} loan={loan} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-secondary-text dark:text-text-muted py-10 flex flex-col items-center">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inbox</span>
                                <p>No loans found matching your criteria</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-8 gap-2 pb-8">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-[#1f3d2e] rounded-lg disabled:opacity-50 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 bg-gray-100 dark:bg-[#1f3d2e] rounded-lg text-sm flex items-center font-medium">
                                    {page} / {totalPages}
                                </span >
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-[#1f3d2e] rounded-lg disabled:opacity-50 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    Next
                                </button >
                            </div >
                        )}
                    </>
                ) : ( // Repledges Tab
                    <>
                        {repledgeLoading ? (
                            <div className="flex justify-center p-12">
                                <GoldCoinSpinner />
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in duration-500">
                                {repledgeEntries.length === 0 ? (
                                    <div className="text-center text-secondary-text dark:text-text-muted py-10 flex flex-col items-center">
                                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">move_item</span>
                                        <p>No repledges found.</p>
                                    </div>
                                ) : (
                                    repledgeEntries.map((item) => (
                                        <div
                                            key={item.id}
                                            className="bg-white dark:bg-[#162b20] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-[#1f3d2e] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-purple-200 dark:hover:border-purple-900 transition-colors group relative cursor-pointer"
                                            onClick={() => navigate(`/re-pledge/${item.id}`)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-lg border border-purple-100 dark:border-purple-800">
                                                    {item.loan_no.slice(-2)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-base text-primary-text dark:text-white">{item.loan_no}</h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                                                        Re-No: <span className="text-gray-700 dark:text-gray-300">{item.re_no}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-4 items-center flex-1 md:justify-end w-full md:w-auto">
                                                <div className="flex flex-col min-w-[80px]">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Bank</span>
                                                    <span className="font-semibold text-sm text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{item.source?.name || 'Unknown'}</span>
                                                </div>
                                                <div className="flex flex-col min-w-[80px]">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Amount</span>
                                                    <span className="font-bold text-sm text-primary-text dark:text-white">₹{Number(item.amount).toLocaleString()}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Status</span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit ${item.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default LoansList;
