import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, SlidersHorizontal, Lock, Banknote, PlusCircle, CheckCircle } from "lucide-react";
import api from "../../api/apiClient";
import { useRepledge } from "../../hooks/useRepledge";
import { useAuth } from "../../context/Auth/AuthContext";

import type { Pledge } from "../../types/models";

interface Props {
  pledges: Pledge[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  loading: boolean;
}

const PledgeList: React.FC<Props> = ({ pledges, searchTerm, onSearchChange, loading }) => {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [activeTab, setActiveTab] = useState<'loans' | 'repledges'>('loans');
  const [expandedPledgeId, setExpandedPledgeId] = useState<number | string | null>(null);
  const { repledgeEntries, fetchRepledgeEntries, loading: repledgeLoading } = useRepledge();

  useEffect(() => {
    if (activeTab === 'repledges') {
      fetchRepledgeEntries();
    }
  }, [activeTab, fetchRepledgeEntries]);

  // Autocomplete State
  const [inputValue, setInputValue] = useState(searchTerm);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Sync input value if parent updates searchTerm (e.g. clear)
  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.length > 1 && inputValue !== searchTerm) {
        api.get('/pledges', { params: { search: inputValue, suggestions: true } })
          .then(res => {
            setSuggestions(res.data.data || []);
            setShowDropdown(true);
          })
          .catch(console.error);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 300); // 300ms debounce for suggestions
    return () => clearTimeout(timer);
  }, [inputValue, searchTerm]);

  const handleSelectSuggestion = (loanNo: string) => {
    setInputValue(loanNo);
    onSearchChange(loanNo); // Trigger parent search
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearchChange(inputValue);
      setShowDropdown(false);
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
    <div className="flex flex-col h-full bg-background dark:bg-background-dark">
      {/* Header Section */}
      <div className="sticky top-0 z-10 bg-background dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-primary dark:text-white">
            Loans
          </h1>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {activeTab === 'loans' ? pledges.length : repledgeEntries.length} items
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('loans')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'loans'
              ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
          >
            Pledges
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

        {/* Search Bar - Autocomplete */}
        <div className="relative" ref={searchRef}>
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by loan no, customer name, or mobile"
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => inputValue.length > 1 && setShowDropdown(true)}
            />
            <button
              className="absolute right-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={() => {
                setInputValue('');
                onSearchChange('');
              }}
            >
              {inputValue ? <X className="w-5 h-5" /> : <SlidersHorizontal className="w-5 h-5" />}
            </button>
          </div>

          {/* Suggestions Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-20">
              {suggestions.map((s) => (
                <div
                  key={s.id}
                  className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  onClick={() => handleSelectSuggestion(s.loan_no)}
                >
                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                    {s.loan_no} • {s.customer_name}
                  </div>
                  {s.mobile_no && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {s.mobile_no}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>



      {/* Pledges List */}
      {activeTab === 'loans' && (
        <>
          {!can('pledge.view') ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Lock className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Access Denied
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You don't have permission to view pledges.
              </p>
              <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-left">
                <p><strong>ASK ADMIN TO ACCESS IT</strong></p>
              </div>
              <div className="mt-1 p-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-left">
                <p>Has Permission: {can('pledge.view') ? 'YES' : 'NO'}</p>
              </div>
            </div>
          ) : (
            <>
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  {/* <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div> */}
                </div>
              ) : (
                <div className="space-y-3 pb-20">
                  {pledges.length === 0 && (
                    <div className="text-center text-secondary-text dark:text-text-muted py-10">
                      No pledges found matching your search.
                    </div>
                  )}
                  {pledges.map((p, index) => (
                    <div
                      key={p.id}
                      onClick={() => setExpandedPledgeId(expandedPledgeId === p.id ? null : p.id)}
                      className="group relative bg-white dark:bg-card-dark rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-none border border-gray-100 dark:border-gray-800/50 flex flex-col p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 animate-in fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar / Image - Simplified */}
                        <img
                          onClick={(e) => { e.stopPropagation(); navigate(`/pledges/${p.id}`); }}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
                          src={fixImageUrl(p.media?.find((m: any) => m.category === 'customer_image')?.url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.customer?.name || 'Unknown')}&background=random&color=fff&bold=true`}
                          alt=""
                        />

                        <div className="flex-1 min-w-0">
                          {/* Header Row: Name & Status */}
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3
                              onClick={(e) => { e.stopPropagation(); navigate(`/pledges/${p.id}`); }}
                              className="font-semibold text-sm text-gray-900 dark:text-white truncate cursor-pointer hover:text-primary transition-colors"
                            >
                              {p.customer?.name || 'Unknown'}
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getStatusColor(p.status || '')}`}>
                              {p.status || 'Active'}
                            </span>
                          </div>

                          {/* Meta Row: Loan No & Date */}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            {p.loan?.loan_no || `#${p.id}`} • {p.loan?.date ? new Date(p.loan.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No Date'}
                          </p>

                          {/* Footer Row: Label & Amount */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Loan Amount</span>
                            <span className="text-sm font-bold text-primary dark:text-primary-light">
                              ₹{Number(p.loan?.amount || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Accordion Content */}
                      <div
                        className={`grid transition-[grid-template-rows] duration-300 ease-out ${expandedPledgeId === p.id ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                          }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="overflow-hidden">
                          <div className={`pt-4 mt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-3 gap-2 ${expandedPledgeId === p.id ? "opacity-100" : "opacity-0 invisible"
                            } transition-all duration-300 delay-75`}>
                            <button className="flex items-center justify-center gap-1.5 px-2 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border border-blue-100 dark:border-blue-800 cursor-pointer">
                              <Banknote size={14} />
                              Partial Payment
                            </button>
                            <button className="flex items-center justify-center gap-1.5 px-2 py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-semibold rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors border border-amber-100 dark:border-amber-800 cursor-pointer">
                              <PlusCircle size={14} />
                              Add Amount
                            </button>
                            <button
                              onClick={() => navigate(`/pledges/${p.id}/close`)}
                              className="flex items-center justify-center gap-1.5 px-2 py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors border border-rose-100 dark:border-rose-800 cursor-pointer"
                            >
                              <CheckCircle size={14} />
                              Close Loan
                            </button>
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
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Lock className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Access Denied
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You don't have permission to view repledges.
              </p>
              <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-left">
                <p><strong>ASK ADMIN TO ACCESS IT</strong></p>
                <p>Check: repledge.view</p>
                <p>Has Permission: {can('repledge.view') ? 'YES' : 'NO'}</p>
              </div>
            </div>
          ) : (
            <>
              {repledgeLoading ? (
                <div className="flex justify-center items-center py-20">
                  {/* <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div> */}
                </div>
              ) : (
                <div className="space-y-3 pb-20">
                  {repledgeEntries.length === 0 && (
                    <div className="text-center text-secondary-text dark:text-text-muted py-10">
                      No repledges found.
                    </div>
                  )}
                  {repledgeEntries.map((item, index) => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/re-pledge/${item.id}`)}
                      className="group relative bg-white dark:bg-card-dark rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-none border border-gray-100 dark:border-gray-800/50 flex flex-col p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 animate-in fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm border-2 border-purple-200 dark:border-purple-800">
                          {item.loan_no.slice(-2)}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Header Row: Loan No & Status */}
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                              {item.loan_no}
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </div>

                          {/* Meta Row: Re-No & Source & Date */}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            RE: {item.re_no} • {item.source?.name || 'Unknown'} • {item.start_date ? new Date(item.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No Date'}
                          </p>

                          {/* Footer Row: Label & Amount */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Repledge Amount</span>
                            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                              ₹{Number(item.amount).toLocaleString()}
                            </span>
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
    </div>
  );
};

export default PledgeList;