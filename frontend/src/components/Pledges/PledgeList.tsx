import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  pledges: any[];
}

const PledgeList: React.FC<Props> = ({ pledges }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPledges = useMemo(() => {
    return pledges.filter((p) => {
      const term = searchTerm.toLowerCase();
      return (
        p.customer?.name?.toLowerCase().includes(term) ||
        p.loan?.loan_no?.toLowerCase().includes(term) ||
        p.customer?.mobile_no?.includes(term) ||
        String(p.id).includes(term)
      );
    });
  }, [pledges, searchTerm]);


  // Helper for random color or logic based on status
  const getStatusColor = (status: string) => {
    if (status === 'closed') return 'text-red-500 bg-red-100 dark:bg-red-500/20 border-red-200 dark:border-red-500/30';
    return 'text-primary bg-green-50 dark:bg-primary/20 border-green-100 dark:border-primary/30';
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-primary-text dark:text-text-main h-full flex flex-col overflow-hidden w-full relative font-display transition-colors duration-300">

      {/* Header Section */}
      <header className="flex-none pt-12 pb-4 px-5 bg-background-light dark:bg-background-dark z-10 transition-colors duration-300">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-primary-text dark:text-white">Loans</h1>
          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-[#1f3d2e] px-3 py-1.5 rounded-full flex items-center shadow-sm dark:shadow-none">
            <span className="text-primary text-xs font-bold uppercase tracking-wider">
              {pledges.length} Loans
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="material-symbols-outlined text-secondary-text dark:text-text-muted">search</span>
          </div>
          <input
            className="block w-full p-3 pl-11 pr-12 text-sm text-primary-text dark:text-white bg-white dark:bg-dark-surface border border-gray-200 dark:border-transparent rounded-xl placeholder-secondary-text dark:placeholder-text-muted focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm outline-none"
            placeholder="Search by name, phone, or loan no..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer">
            <span className="material-symbols-outlined text-primary">tune</span>
          </div>
        </div>
      </header>

      {/* Main Content: List */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative px-5 pb-24">
        {filteredPledges.length === 0 && (
          <div className="text-center text-secondary-text dark:text-text-muted py-10">
            No pledges found matching your search.
          </div>
        )}

        {filteredPledges.map((p) => (
          <div
            key={p.id}
            onClick={() => navigate(`/pledges/${p.id}`)}
            className="group py-5 border-b border-gray-100 dark:border-[#1f3d2e] flex items-start gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            {/* Avatar / Image */}
            <div className="flex-shrink-0 relative">
              <img
                alt={p.customer?.name}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-white dark:ring-[#1f3d2e] shadow-sm dark:shadow-none"
                src={p.media?.find((m: any) => m.category === 'customer_image')?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.customer?.name || 'Unknown')}&background=random&color=fff&bold=true`}
              />
            </div>

            <div className="flex-1 min-w-0 flex flex-col h-full justify-between gap-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-medium text-primary-text dark:text-white truncate pr-2">
                    {p.customer?.name || 'Unknown'}
                  </h3>
                  <p className="text-xs text-secondary-text dark:text-text-muted font-medium mt-0.5">
                    {p.loan?.date || 'No Date'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center border ${getStatusColor(p.status)}`}>
                    <span className={`text-[10px] font-bold ${p.status === 'closed' ? 'text-red-500' : 'text-primary'}`}>
                      {p.status ? p.status.charAt(0).toUpperCase() : 'A'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-end mt-2">
                <p className="text-xs text-secondary-text dark:text-text-muted">
                  Loan No. <span className="text-primary-text dark:text-gray-400 font-medium">{p.loan?.loan_no || `#${p.id} `}</span>
                </p>
                <p className="text-sm font-semibold text-primary">
                  ₹{Number(p.loan?.amount || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Global Bottom Navigation - Moved to Layout */}
    </div>
  );
};

export default PledgeList;
