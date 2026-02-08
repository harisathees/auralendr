import { useAuth } from "../../context/Auth/AuthContext";
import DashboardFilters from "../../components/Dashboard/DashboardFilters";
import { LogOut, LayoutDashboard, Repeat, BarChart3 } from "lucide-react";
import React, { useState } from "react";
import LoansDashboard from "./LoansDashboard";
import RepledgeDashboard from "./RepledgeDashboard";
import BusinessOverviewDashboard from "./BusinessOverviewDashboard";
import AdminSidebarMenu from "../../components/Dashboard/AdminSidebarMenu";

type Tab = 'loans' | 'repledge' | 'business';

const AdminDashboard: React.FC = () => {
  const { user, logout, enableBankPledge } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('business');
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [filters, setFilters] = useState<{ branch_id?: number; start_date?: string; end_date?: string }>({});

  const getStorageUrl = (url: string | null) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // Assuming VITE_API_BASE_URL includes '/api', we strip it to get root
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || '';
    return `${baseUrl}${url}`;
  };

  const handleLogoutClick = () => {
    setShowMenu(false);
    setShowConfirm(true);
  };



  const confirmLogout = () => {
    logout();
  };

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen transition-colors duration-300 relative">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-[#121417]/80 backdrop-blur-md px-4 md:px-8 py-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-800 -mx-4 md:-mx-8 -mt-4 md:-mt-8 mb-4 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="w-10 h-10 rounded-full bg-[#FDB931] flex items-center justify-center text-black font-bold border-2 border-white dark:border-[#1A1D1F] overflow-hidden shadow-md cursor-pointer hover:opacity-80 transition-opacity relative group"
              onClick={() => setShowMenu(!showMenu)}
            >
              {user?.photo_url ? (
                <img src={getStorageUrl(user.photo_url)} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=FDB931&color=000`} alt="Admin" />
              )}
            </div>


          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-tight">Welcome back,</p>
            <h1 className="text-lg font-bold text-gray-900 dark:text-[#00E676] transition-colors duration-300 leading-tight">
              {user?.name || 'Admin'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:block text-right mr-2">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Status</h2>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
              <span className="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase">Live Systems</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DashboardFilters onFilterChange={setFilters} isLoading={false} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-200 dark:border-gray-700/50">
          <button
            onClick={() => setActiveTab('business')}
            className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'business'
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
          >
            <BarChart3 className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'loans'
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Loans
          </button>
          {enableBankPledge && (
            <button
              onClick={() => setActiveTab('repledge')}
              className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'repledge'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              <Repeat className="w-4 h-4" />
              Bank Pledge
            </button>
          )}
        </div>
      </div>

      {/* Dashboard Body */}
      {
        activeTab === 'business' ? (
          <BusinessOverviewDashboard filters={filters} />
        ) : activeTab === 'loans' ? (
          <LoansDashboard filters={filters} />
        ) : (
          <RepledgeDashboard filters={filters} />
        )
      }

      <AdminSidebarMenu
        show={showMenu}
        onClose={() => setShowMenu(false)}
        onLogout={handleLogoutClick}
      />

      {/* Logout Confirmation Modal */}
      {
        showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative z-10 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center mb-4 mx-auto">
                <LogOut className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">Log Out?</h3>
              <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to log out of your account?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="w-full py-3 rounded-xl font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="w-full py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default AdminDashboard;
