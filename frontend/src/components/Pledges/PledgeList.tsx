import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../api/http";
import { useRepledge } from "../../hooks/useRepledge";

interface Props {
  pledges: any[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  loading: boolean;
}

const PledgeList: React.FC<Props> = ({ pledges, searchTerm, onSearchChange, loading }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'loans' | 'repledges'>('loans');
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
        http.get('/pledges', { params: { search: inputValue, suggestions: true } })
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
    if (status === 'closed') return 'text-red-500 bg-red-100 dark:bg-red-500/20 border-red-200 dark:border-red-500/30';
    return 'text-primary bg-green-50 dark:bg-primary/20 border-green-100 dark:border-primary/30';
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
    <div className="bg-background-light dark:bg-background-dark text-primary-text dark:text-text-main h-full flex flex-col overflow-hidden w-full relative font-display transition-colors duration-300">

      {/* Header Section */}
      <header className="flex-none pt-12 pb-4 px-5 bg-background-light dark:bg-background-dark z-10 transition-colors duration-300">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-primary-text dark:text-white">Loans</h1>
          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-[#1f3d2e] px-3 py-1.5 rounded-full flex items-center shadow-sm dark:shadow-none">
            <span className="text-primary text-xs font-bold uppercase tracking-wider">
              {activeTab === 'loans' ? pledges.length : repledgeEntries.length} items
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl mb-6">
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
        <div className="relative w-full group" ref={searchRef}>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="material-symbols-outlined text-secondary-text dark:text-text-muted">search</span>
          </div>
          <input
            className="block w-full p-3 pl-11 pr-12 text-sm text-primary-text dark:text-white bg-white dark:bg-dark-surface border border-gray-200 dark:border-transparent rounded-xl placeholder-secondary-text dark:placeholder-text-muted focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm outline-none"
            placeholder="Search by name, phone, or loan no..."
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue.length > 1 && setShowDropdown(true)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" onClick={() => { setInputValue(''); onSearchChange(''); }}>
            {inputValue ? <span className="material-symbols-outlined text-gray-400 hover:text-gray-600">close</span> : <span className="material-symbols-outlined text-primary">tune</span>}
          </div>

          {/* Suggestions Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1C1C1E] rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 max-h-60 overflow-y-auto z-50">
              {suggestions.map((s) => (
                <div
                  key={s.id}
                  className="p-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer border-b border-gray-50 dark:border-gray-800/50 last:border-0"
                  onClick={() => handleSelectSuggestion(s.loan_no)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-primary-text dark:text-gray-200 text-sm">{s.loan_no}</span>
                    <span className="text-xs text-gray-500">{s.customer_name}</span>
                  </div>
                  {s.mobile_no && <div className="text-xs text-gray-400 mt-0.5">{s.mobile_no}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content: List */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative px-5 pb-24">
        {(loading || (activeTab === 'repledges' && repledgeLoading)) && (
          <div className="text-center py-10">
            <span className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
          </div>
        )}

        {/* Pledges List */}
        {activeTab === 'loans' && !loading && (
          <div className="grid gap-4 mt-2">
            {pledges.length === 0 && (
              <div className="text-center text-secondary-text dark:text-text-muted py-10">
                No pledges found matching your search.
              </div>
            )}
            {pledges.map((p, index) => (
              <div
                key={p.id}
                onClick={() => navigate(`/pledges/${p.id}`)}
                className="group relative bg-white dark:bg-card-dark rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-none border border-gray-100 dark:border-gray-800/50 flex flex-col p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 animate-in fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar / Image - Simplified */}
                  <div className="flex-shrink-0 relative">
                    <img
                      alt={p.customer?.name}
                      className="h-14 w-14 rounded-full object-cover bg-gray-100 dark:bg-gray-800"
                      src={fixImageUrl(p.media?.find((m: any) => m.category === 'customer_image')?.url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.customer?.name || 'Unknown')}&background=random&color=fff&bold=true`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header Row: Name & Status */}
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-base font-bold text-primary-text dark:text-white truncate leading-tight">
                        {p.customer?.name || 'Unknown'}
                      </h3>
                      <div className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(p.status)}`}>
                        {p.status || 'Active'}
                      </div>
                    </div>

                    {/* Meta Row: Loan No & Date */}
                    <div className="flex items-center gap-2 mt-1 min-w-0">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {p.loan?.loan_no || `#${p.id}`}
                      </span>
                      <span className="text-xs text-secondary-text dark:text-gray-500 font-medium truncate">
                        • {p.loan?.date ? new Date(p.loan.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No Date'}
                      </span>
                    </div>

                    {/* Footer Row: Label & Amount */}
                    <div className="flex justify-end items-end mt-2">
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-bold text-primary leading-none whitespace-nowrap">
                          ₹{Number(p.loan?.amount || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Repledges List */}
        {activeTab === 'repledges' && !repledgeLoading && (
          <div className="grid gap-4 mt-2">
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
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 relative">
                    <div className="h-14 w-14 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-lg border border-purple-100 dark:border-purple-800/30">
                      {item.loan_no.slice(-2)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header Row: Loan No & Status */}
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-base font-bold text-primary-text dark:text-white truncate leading-tight">
                        {item.loan_no}
                      </h3>
                      <div className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${item.status === 'active' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 border-purple-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                        {item.status}
                      </div>
                    </div>

                    {/* Meta Row: Re-No & Source & Date */}
                    <div className="flex items-center gap-2 mt-1 min-w-0">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        RE: {item.re_no}
                      </span>
                      <span className="text-xs text-secondary-text dark:text-gray-500 font-medium truncate">
                        • {item.source?.name || 'Unknown'} • {item.start_date ? new Date(item.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No Date'}
                      </span>
                    </div>

                    {/* Footer Row: Label & Amount */}
                    <div className="flex justify-end items-end mt-2">
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-bold text-purple-600 leading-none whitespace-nowrap">
                          ₹{Number(item.amount).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Global Bottom Navigation - Moved to Layout */}
    </div>
  );
};

export default PledgeList;
