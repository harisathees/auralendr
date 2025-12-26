import { useAuth } from "../../context/Auth/AuthContext";
import { useTheme } from "../../context/Theme/ThemeContext";
// import MetalRatesCard from "../../components/Dashboard/MetalRatesCard";
import StatsCard from "../../components/Dashboard/StatsCard";
import DashboardFilters from "../../components/Dashboard/DashboardFilters";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useState, useEffect } from "react";
import api from "../../api/apiClient";
import { toast } from "react-hot-toast";

interface DashboardStats {
  summary: {
    total_pledges: number;
    active_pledges: number;
    closed_pledges: number;
    total_loan_amount: number;
    interest_collected: number;
  };
  trends: {
    month: string;
    total_amount: number;
    count: number;
  }[];
  branch_distribution: {
    branch_name: string;
    count: number;
    total_amount: number;
  }[];
  status_distribution: {
    status: string;
    count: number;
  }[];
}

const COLORS = ['#00E676', '#FFAB00', '#FF5252', '#2979FF', '#AA00FF'];

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filters, setFilters] = useState<{ branch_id?: number; start_date?: string; end_date?: string }>({});

  const handleLogoutClick = () => {
    setShowMenu(false);
    setShowConfirm(true);
  };

  const confirmLogout = () => {
    logout();
  };

  useEffect(() => {
    fetchStats();
  }, [filters]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.get("/dashboard/stats", { params: filters });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(Number(amount));
  };

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-[#121417]/80 backdrop-blur-md px-4 md:px-8 py-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-800 -mx-4 md:-mx-8 -mt-4 md:-mt-8 mb-4 transition-colors duration-300">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#00E676] transition-colors duration-300">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Welcome back, Admin</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#1A1D1F] flex items-center justify-center border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-sm transition-all duration-300"
          >
            <span className="material-symbols-outlined">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <div className="relative">
            <div
              className="w-10 h-10 rounded-full bg-[#FDB931] flex items-center justify-center text-black font-bold border-2 border-white dark:border-[#1A1D1F] overflow-hidden shadow-md cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setShowMenu(!showMenu)}
            >
              <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=FDB931&color=000`} alt="Admin" />
            </div>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute top-12 right-0 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FDB931] flex items-center justify-center text-black font-bold border border-white dark:border-[#1A1D1F] overflow-hidden shrink-0">
                      <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=FDB931&color=000`} alt="Admin" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name || "Admin"}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role || 'Administrator'}</p>
                    </div>
                  </div>
                  <button
                    className="text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 mx-2 rounded-lg transition-colors w-[calc(100%-1rem)]"
                    onClick={handleLogoutClick}
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <DashboardFilters onFilterChange={setFilters} />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Principal"
          value={stats?.summary ? formatCurrency(stats.summary.total_loan_amount) : "..."}
          valueColor="text-[#00E676]"
          icon="payments"
        />
        <StatsCard
          title="Interest Collected"
          value={stats?.summary ? formatCurrency(stats.summary.interest_collected) : "..."}
          valueColor="text-[#2979FF]"
          icon="account_balance_wallet"
        />
        <StatsCard
          title="Total Pledges"
          value={stats?.summary ? stats.summary.total_pledges.toString() : "..."}
          valueColor="text-[#FFAB00]"
          icon="description"
        />
        <StatsCard
          title="Active Pledges"
          value={stats?.summary ? stats.summary.active_pledges.toString() : "..."}
          valueColor="text-[#00E676]"
          icon="check_circle"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metal Rates Card - Commented as requested */}
        {/* <div className="lg:col-span-1">
          <MetalRatesCard />
        </div> */}

        {/* Loan Trends */}
        <div className="lg:col-span-3 bg-white dark:bg-[#1A1D1F] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Loan Trends (Last 6 Months)</h3>
          <div className="h-[300px]">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E676]"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.trends ?? []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#2d3339' : '#e5e7eb'} />
                  <XAxis dataKey="month" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} />
                  <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} />
                  <Tooltip
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#1A1D1F' : '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ color: '#00E676', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="total_amount" fill="#00E676" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch Distribution */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1A1D1F] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm min-h-[400px]">
          <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Branch Wise Lending</h3>
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E676]"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-100 dark:border-gray-800">
                    <th className="pb-4 font-bold text-gray-500 dark:text-gray-400">Branch</th>
                    <th className="pb-4 font-bold text-gray-500 dark:text-gray-400 text-right">Pledges</th>
                    <th className="pb-4 font-bold text-gray-500 dark:text-gray-400 text-right">Total Leant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {stats?.branch_distribution?.map((branch, idx) => (
                    <tr key={idx} className="group">
                      <td className="py-4 font-medium text-gray-900 dark:text-white">{branch.branch_name}</td>
                      <td className="py-4 text-right text-gray-600 dark:text-gray-400">{branch.count}</td>
                      <td className="py-4 text-right font-bold text-[#00E676]">{formatCurrency(branch.total_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="lg:col-span-1 bg-white dark:bg-[#1A1D1F] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Pledge Status</h3>
          <div className="h-[250px]">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E676]"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.status_distribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                  >
                    {(stats?.status_distribution || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {stats?.status_distribution?.map((entry, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="capitalize text-gray-600 dark:text-gray-400">{entry.status}</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{entry.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative z-10 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center mb-4 mx-auto">
              <span className="material-symbols-outlined text-3xl">logout</span>
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
      )}

    </div>
  );
};

export default AdminDashboard;
