import React, { useState, useEffect } from "react";
import api from "../../../api/apiClient";
import { useNavigate } from "react-router-dom";
import { Search, X, SlidersHorizontal, Store, User as UserIcon } from "lucide-react";
import { useRepledge } from "../../../hooks/useRepledge";
import { useAuth } from "../../../context/Auth/AuthContext";

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
        media?: Array<{
            url: string;
            category: string;
        }>;
    };
}

const LoanAccordionCard: React.FC<{ loan: Loan }> = ({ loan }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    // Helpers to match app theme
    const getStatusColor = (status: string) => {
        if (status === 'closed') return 'text-rose-700 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/30';
        return 'text-primary bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30';
    };

    const handleProfileClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/admin/pledges/${loan.pledge_id}`);
    };

    // Helper to fix localhost image URLs (missing port)
    const fixImageUrl = (url: string | undefined | null) => {
        if (!url) return null;
        if (url.startsWith('http://localhost/') && !url.includes(':8000')) {
            return url.replace('http://localhost/', 'http://localhost:8000/');
        }
        return url;
    };

    const customerImage = loan.pledge?.media?.find(m => m.category === 'customer_image')?.url;

    return (
        <div
            onClick={() => setIsOpen(!isOpen)}
            className="group relative bg-white dark:bg-[#1A1D1F] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col p-4 cursor-pointer hover:shadow-md transition-all duration-300"
        >
            {/* Header portion of the card */}
            <div className="flex items-start gap-4">
                <div className="relative">
                    <img
                        onClick={handleProfileClick}
                        className="w-14 h-14 rounded-2xl object-cover border border-gray-100 dark:border-gray-800 shadow-sm cursor-pointer hover:opacity-80 transition-opacity bg-gray-50"
                        src={fixImageUrl(customerImage) || `https://ui-avatars.com/api/?name=${encodeURIComponent(loan.pledge?.customer?.name || 'Unknown')}&background=random&color=fff&bold=true`}
                        alt=""
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#1A1D1F] ${loan.status === 'closed' ? 'bg-rose-500' : 'bg-primary'}`} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <h3
                            onClick={handleProfileClick}
                            className="font-black text-sm text-gray-900 dark:text-white truncate cursor-pointer hover:text-primary transition-colors uppercase tracking-tight"
                        >
                            {loan.pledge?.customer?.name || 'Unknown'}
                        </h3>
                        <span className={`text-sm font-black px-2 py-0.5 rounded-lg border ${getStatusColor(loan.status)}`}>
                            ₹{Number(loan.amount).toLocaleString()}
                        </span>
                    </div>

                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-0.5 flex items-center gap-1.5">
                        <span className="text-primary">{loan.loan_no}</span>
                        <span className="opacity-30">•</span>
                        <span>{new Date(loan.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </p>
                </div>
            </div>

            {/* Expanded Content (Accordion Body) */}
            <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
                <div className="overflow-hidden">
                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Mobile</span>
                                <p className="text-xs font-bold text-gray-900 dark:text-white">{loan.pledge?.customer?.mobile_no}</p>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Created By</span>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-white">
                                    <UserIcon size={12} className="text-gray-400" />
                                    <span>{loan.pledge?.user?.name || 'Admin'}</span>
                                </div>
                            </div>
                            <div className="flex flex-col col-span-2">
                                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Branch</span>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-white">
                                    <Store size={12} className="text-gray-400" />
                                    <span>{loan.pledge?.branch?.branch_name || 'Main'}</span>
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

    // Repledge State (from hook)
    const { repledgeEntries, fetchRepledgeEntries, loading: repledgeLoading } = useRepledge();
    const { enableBankPledge } = useAuth();

    // 1. Fetch Data when tab, page, statusFilter, or searchTerm changes
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (activeTab === 'loans') {
                fetchLoans();
            } else {
                fetchRepledgeEntries(page, searchTerm);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [page, statusFilter, searchTerm, activeTab]);

    // 2. Reset page when tab changes
    useEffect(() => {
        setPage(1);
    }, [activeTab]);

    // Ref to store the latest abort controller for Loans
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
                `/admin-all-loans`,
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
        <div className="fixed inset-0 bottom-0 md:bottom-0 flex flex-col bg-background-light dark:bg-background-dark overflow-hidden font-display">
            {/* Header Section */}
            <div className="flex-none bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 pt-6 pb-4 z-40">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black text-gray-900 dark:text-white leading-tight uppercase tracking-tight">
                            {activeTab === 'loans' ? 'All Loans' : 'Bank Pledges'}
                        </h1>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            {activeTab === 'loans' ? loans.length : repledgeEntries.length} Visible
                        </p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-2 mb-4 bg-gray-50 dark:bg-[#1A1D1F] p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('loans')}
                        className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'loans'
                            ? 'bg-white dark:bg-gray-800 text-primary shadow-sm ring-1 ring-black/5'
                            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'
                            }`}
                    >
                        Loans
                    </button>
                    {enableBankPledge && (
                        <button
                            onClick={() => setActiveTab('repledges')}
                            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'repledges'
                                ? 'bg-white dark:bg-gray-800 text-purple-600 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'
                                }`}
                        >
                            Bank Pledges
                        </button>
                    )}
                </div>

                {/* Search & Filter */}
                <div className="flex gap-3 items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                        <input
                            type="text"
                            placeholder={activeTab === 'loans' ? "Search loans, customers..." : "Search bank pledges, sources..."}
                            className="w-full h-12 pl-12 pr-12 text-sm bg-gray-50 dark:bg-[#1A1D1F] border border-gray-100 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-gray-900 dark:text-white placeholder-gray-400 font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                className="absolute right-4 text-gray-400 hover:text-red-500 transition-colors"
                                onClick={() => setSearchTerm('')}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {activeTab === 'loans' && (
                        <div className="relative w-1/3">
                            <select
                                className="w-full h-12 px-4 text-sm bg-gray-50 dark:bg-[#1A1D1F] border border-gray-100 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-gray-900 dark:text-white font-bold appearance-none"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">Status: All</option>
                                <option value="active">Active</option>
                                <option value="closed">Closed</option>
                                <option value="auctioned">Auctioned</option>
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth p-4">
                {activeTab === 'loans' ? (
                    <>
                        {loadingLoans ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-60">
                                <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
                                <p className="text-sm font-medium text-gray-500">Loading loans...</p>
                            </div>
                        ) : (
                            <div className="space-y-4 pb-12">
                                {loans.length === 0 ? (
                                    <div className="text-center text-gray-500 py-16 animate-in fade-in duration-500">
                                        <span className="material-symbols-outlined text-6xl opacity-10 mb-2">search_off</span>
                                        <p className="font-bold">No results found</p>
                                    </div>
                                ) : (
                                    loans.map((loan, index) => (
                                        <div
                                            key={loan.id}
                                            className="animate-in fade-in slide-in-from-bottom-2"
                                            style={{ animationDelay: `${index * 40}ms` }}
                                        >
                                            <LoanAccordionCard loan={loan} />
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-4 gap-2 pb-12">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 h-10 bg-white dark:bg-[#1A1D1F] border border-gray-100 dark:border-gray-800 rounded-xl disabled:opacity-50 text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-95"
                                >
                                    Prev
                                </button>
                                <div className="px-4 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-black flex items-center">
                                    {page} / {totalPages}
                                </div>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 h-10 bg-white dark:bg-[#1A1D1F] border border-gray-100 dark:border-gray-800 rounded-xl disabled:opacity-50 text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-95"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="space-y-4 pb-12">
                        {repledgeLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-60">
                                <span className="material-symbols-outlined animate-spin text-3xl text-purple-600">progress_activity</span>
                                <p className="text-sm font-medium text-gray-500">Loading bank pledges...</p>
                            </div>
                        ) : repledgeEntries.length === 0 ? (
                            <div className="text-center text-gray-500 py-16">
                                <span className="material-symbols-outlined text-6xl opacity-10 mb-2">autorenew</span>
                                <p className="font-bold">No bank pledges recorded</p>
                            </div>
                        ) : (
                            repledgeEntries.map((item, index) => {
                                const customerName = (item as any).loan?.pledge?.customer?.name || 'Unknown';
                                const displayDate = item.start_date ? new Date(item.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No Date';

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => navigate(`/re-pledge/${item.id}`)}
                                        className="group relative bg-white dark:bg-[#1A1D1F] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col p-4 cursor-pointer hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                                        style={{ animationDelay: `${index * 40}ms` }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="relative">
                                                <img
                                                    className="w-14 h-14 rounded-2xl object-cover border border-gray-100 dark:border-gray-800 shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}&background=random&color=fff&bold=true`}
                                                    alt=""
                                                />
                                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#1A1D1F] ${item.status === 'closed' ? 'bg-rose-500' : 'bg-purple-600'}`} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <h3 className="font-black text-sm text-gray-900 dark:text-white truncate transition-colors uppercase tracking-tight">
                                                        {customerName}
                                                    </h3>
                                                    <span className={`text-sm font-black px-2 py-0.5 rounded-lg border ${item.status === 'closed' ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-purple-600 bg-purple-50 border-purple-100'}`}>
                                                        ₹{Number(item.amount).toLocaleString()}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-y-1 gap-x-1.5">
                                                    <span className="text-xs font-bold text-purple-600">{item.loan_no}</span>
                                                    <span className="opacity-30 text-xs">•</span>
                                                    <span className="text-xs font-bold text-gray-400">RE: {item.re_no}</span>
                                                    <span className="opacity-30 text-xs">•</span>
                                                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-tight truncate max-w-[80px]">
                                                        {item.source?.name || 'Unknown'}
                                                    </span>
                                                    <span className="opacity-30 text-xs">•</span>
                                                    <span className="text-[10px] font-bold text-gray-400">
                                                        {displayDate}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoansList;
