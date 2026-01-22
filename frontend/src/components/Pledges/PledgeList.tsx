import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, SlidersHorizontal, Lock, Banknote, PlusCircle, CheckCircle } from "lucide-react";
import { useRepledge } from "../../hooks/useRepledge";
import { useAuth } from "../../context/Auth/AuthContext";
import SecureImage from "../Shared/SecureImage";

import type { Pledge } from "../../types/models";

interface Props {
  pledges: Pledge[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  loading: boolean;
  activeTab: 'loans' | 'repledges';
  onTabChange: (tab: 'loans' | 'repledges') => void;
}

const PledgeList: React.FC<Props> = ({ pledges, searchTerm, onSearchChange, loading, activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [expandedPledgeId, setExpandedPledgeId] = useState<number | string | null>(null);
  const { repledgeEntries, fetchRepledgeEntries, loading: repledgeLoading } = useRepledge();

  useEffect(() => {
    if (activeTab === 'repledges') {
      fetchRepledgeEntries(1, searchTerm);
    }
  }, [activeTab, fetchRepledgeEntries, searchTerm]);

  // Search State
  const [inputValue, setInputValue] = useState(searchTerm);

  // Sync input value if parent updates searchTerm (e.g. clear)
  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);


  // Debounced Live Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== searchTerm) {
        onSearchChange(inputValue);
      }
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [inputValue, searchTerm, onSearchChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearchChange(inputValue);
    }
  };

  // Helper for random color or logic based on status
  const getStatusColor = (status: string) => {
    if (status === 'closed') return 'text-rose-700 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/30';
    if (status === 'overdue') return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30';
    return 'text-primary bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30';
  };

  // Helper to fix localhost image URLs (missing port)
  const fixImageUrl = (url: string | undefined | null) => {
    if (!url) return null;
    if (url.startsWith('http://localhost/') && !url.includes(':8000')) {
      return url.replace('http://localhost/', 'http://localhost:8000/');
    }
    return url;
  };

  return (
    <div className="fixed inset-0 bottom-[76px] flex flex-col bg-background-light dark:bg-background-dark overflow-hidden font-display">
      {/* Header Section - Truly Fixed Position via Flex Parent */}
      <div className="flex-none bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 pt-6 pb-4 z-40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-gray-900 dark:text-white leading-tight uppercase tracking-tight">
              Loans
            </h1>
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              {activeTab === 'loans' ? pledges.length : repledgeEntries.length} Records Found
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-4 bg-gray-50 dark:bg-[#1A1D1F] p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800">
          <button
            onClick={() => onTabChange('loans')}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'loans'
              ? 'bg-white dark:bg-gray-800 text-primary shadow-sm ring-1 ring-black/5'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'
              }`}
          >
            Pledges
          </button>
          <button
            onClick={() => onTabChange('repledges')}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'repledges'
              ? 'bg-white dark:bg-gray-800 text-purple-600 shadow-sm ring-1 ring-black/5'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'
              }`}
          >
            Repledges
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="relative flex items-center group">
            <Search className="absolute left-4 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
            <input
              type="text"
              placeholder={activeTab === 'loans' ? "Search loans, customers..." : "Search re-no, sources, customer..."}
              className="w-full h-12 pl-12 pr-12 text-sm bg-gray-50 dark:bg-[#1A1D1F] border border-gray-100 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-gray-900 dark:text-white placeholder-gray-400 font-bold"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => { }}
            />
            <button
              className="absolute right-4 text-gray-400 hover:text-red-500 transition-colors"
              onClick={() => {
                setInputValue('');
                onSearchChange('');
              }}
            >
              {inputValue ? <X className="w-5 h-5" /> : <SlidersHorizontal className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Area - Independently Scrollable */}
      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth p-4">
        {/* Pledges List */}
        {activeTab === 'loans' && (
          <>
            {!can('pledge.view') ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <Lock className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Locked Section
                </h3>
                <p className="text-sm text-gray-500 max-w-[200px]">
                  Please contact administrator to unlock this module.
                </p>
              </div>
            ) : (
              <>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-gray-100 dark:border-gray-800 border-t-primary"></div>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest animate-pulse">Loading loans...</p>
                  </div>
                ) : (
                  <div className="space-y-4 pb-12">
                    {pledges.length === 0 && (
                      <div className="text-center text-gray-500 py-16 animate-in fade-in duration-500">
                        <span className="material-symbols-outlined text-6xl opacity-10 mb-2">search_off</span>
                        <p className="font-bold">No results found</p>
                        <p className="text-xs">Try adjusting your filters</p>
                      </div>
                    )}
                    {pledges.map((p, index) => (
                      <div
                        key={p.id}
                        onClick={() => setExpandedPledgeId(expandedPledgeId === p.id ? null : p.id)}
                        className="group relative bg-white dark:bg-[#1A1D1F] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col p-4 cursor-pointer hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <SecureImage
                              onClick={(e: React.MouseEvent) => { e.stopPropagation(); navigate(`/pledges/${p.id}`); }}
                              className="w-14 h-14 rounded-2xl object-cover border border-gray-100 dark:border-gray-800 shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                              mediaId={p.media?.find((m: any) => m.category === 'customer_image')?.id}
                              fallbackSrc={fixImageUrl(p.media?.find((m: any) => m.category === 'customer_image')?.url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.customer?.name || 'Unknown')}&background=random&color=fff&bold=true`}
                              alt=""
                            />
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#1A1D1F] ${p.status === 'closed' ? 'bg-rose-500' : 'bg-primary'}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h3
                                onClick={(e) => { e.stopPropagation(); navigate(`/pledges/${p.id}`); }}
                                className="font-black text-sm text-gray-900 dark:text-white truncate cursor-pointer hover:text-primary transition-colors uppercase tracking-tight"
                              >
                                {p.customer?.name || 'Unknown'}
                              </h3>
                              <span className={`text-sm font-black px-2 py-0.5 rounded-lg border ${getStatusColor(p.status || '')}`}>
                                ₹{Number(p.loan?.amount || 0).toLocaleString()}
                              </span>
                            </div>

                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
                              <span className="text-primary">{p.loan?.loan_no || `#${p.id}`}</span>
                              <span className="opacity-30">•</span>
                              <span>{p.loan?.date ? new Date(p.loan.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No Date'}</span>
                            </p>

                          </div>
                        </div>

                        {/* Expanded Content */}
                        <div
                          className={`grid transition-[grid-template-rows] duration-300 ease-out ${expandedPledgeId === p.id ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                            }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="overflow-hidden">
                            <div className={`pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-2 ${expandedPledgeId === p.id ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                              } transition-all duration-300`}>
                              {p.status === 'closed' ? (
                                Number(p.closure?.balance_amount) > 0 && (
                                  <button
                                    onClick={() => navigate(`/transactions/create?amount=${p.closure?.balance_amount}&description=Balance payment for Loan ${p.loan?.loan_no}&type=credit&pledgeId=${p.id}`)}
                                    className="col-span-3 h-11 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                                  >
                                    <Banknote size={16} />
                                    Pay Balance (₹{p.closure?.balance_amount})
                                  </button>
                                )
                              ) : (
                                <>
                                  <button className="h-11 flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100 dark:border-blue-800/50">
                                    <Banknote size={16} />
                                    <span className="text-[9px] font-black uppercase mt-0.5">Partial</span>
                                  </button>
                                  <button className="h-11 flex flex-col items-center justify-center bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-100 transition-colors border border-amber-100 dark:border-amber-800/50">
                                    <PlusCircle size={16} />
                                    <span className="text-[9px] font-black uppercase mt-0.5">Top-up</span>
                                  </button>
                                  <button
                                    onClick={() => navigate(`/pledges/${p.id}/close`)}
                                    className="h-11 flex flex-col items-center justify-center bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-100 transition-colors border border-rose-100 dark:border-rose-800/50"
                                  >
                                    <CheckCircle size={16} />
                                    <span className="text-[9px] font-black uppercase mt-0.5">Close</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Repledges List */}
        {activeTab === 'repledges' && (
          <>
            {!can('repledge.view') ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <Lock className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Locked Section
                </h3>
                <p className="text-sm text-gray-500 max-w-[200px]">
                  Permissions required for Repledges module.
                </p>
              </div>
            ) : (
              <>
                {repledgeLoading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-gray-100 dark:border-gray-800 border-t-purple-600 shadow-sm"></div>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest animate-pulse">Loading repledges...</p>
                  </div>
                ) : (
                  <div className="space-y-4 pb-12">
                    {repledgeEntries.length === 0 && (
                      <div className="text-center text-gray-500 py-16">
                        <span className="material-symbols-outlined text-6xl opacity-10 mb-2">autorenew</span>
                        <p className="font-bold">No repledges recorded</p>
                      </div>
                    )}
                    {repledgeEntries.map((item, index) => {
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
                                <span className={`text-sm font-black px-2 py-0.5 rounded-lg border ${getStatusColor(item.status)}`}>
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
                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                  {displayDate}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PledgeList;