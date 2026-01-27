import { useAuth } from "../../context/Auth/AuthContext";
import { useTheme } from "../../context/Theme/ThemeContext";
import StatsCard from "../../components/Dashboard/StatsCard";
import DashboardFilters from "../../components/Dashboard/DashboardFilters";
import ReportCard from "../../components/Dashboard/ReportCard";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { LogOut, Sun, Moon, User, Camera, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../../api/apiClient";
import { toast } from "react-hot-toast";
import { compressImage } from "../../utils/imageCompression";

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
  const { user, logout, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [showMenu, setShowMenu] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filters, setFilters] = useState<{ branch_id?: number; start_date?: string; end_date?: string }>({});

  const handleLogoutClick = () => {
    setShowMenu(false);
    setShowConfirm(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    setIsUploading(true);
    try {
      const file = e.target.files[0];
      const compressed = await compressImage(file);

      const fd = new FormData();
      // Backend validation requires name and email
      fd.append('name', user.name);
      fd.append('email', user.email);
      if (user.phone_number) {
        fd.append('phone_number', user.phone_number);
      }

      fd.append('files[]', compressed);
      fd.append('categories[]', 'profile_photo');

      await api.post('/me/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await refreshUser();
      toast.success("Profile photo updated successfully");
    } catch (error) {
      console.error("Profile photo upload failed:", error);
      toast.error("Failed to upload profile photo");
    } finally {
      setIsUploading(false);
    }
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

  // Calculate growth percentage from trends
  const calculateGrowth = (key: 'total_amount' | 'count') => {
    if (!stats?.trends || stats.trends.length < 2) return null;
    const current = stats.trends[stats.trends.length - 1][key];
    const previous = stats.trends[stats.trends.length - 2][key];
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const growth = ((current - previous) / previous) * 100;
    return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
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
              {isUploading ? (
                <Loader2 className="w-5 h-5 text-black animate-spin" />
              ) : user?.photo_url ? (
                <img src={user.photo_url} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=FDB931&color=000`} alt="Admin" />
              )}
            </div>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute top-12 left-0 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FDB931] flex items-center justify-center text-black font-bold border border-white dark:border-[#1A1D1F] overflow-hidden shrink-0 relative group">
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 text-black animate-spin" />
                      ) : user?.photo_url ? (
                        <img src={user.photo_url} alt="Admin" className="w-full h-full object-cover" />
                      ) : (
                        <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=FDB931&color=000`} alt="Admin" />
                      )}

                      {/* Camera Overlay */}
                      {!isUploading && (
                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                          <Camera className="w-3 h-3 text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoUpload}
                            disabled={isUploading}
                          />
                        </label>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name || "Admin"}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role || 'Administrator'}</p>
                    </div>
                  </div>
                  <button
                    className="text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 mx-2 rounded-lg transition-colors w-[calc(100%-1rem)]"
                    onClick={() => window.location.href = '/admin/profile'}
                  >
                    <User className="w-5 h-5" />
                    Profile & Password
                  </button>
                  <button
                    className="text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 mx-2 rounded-lg transition-colors w-[calc(100%-1rem)]"
                    onClick={handleLogoutClick}
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </>
            )}
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
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-white dark:bg-[#1A1D1F] flex items-center justify-center border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-sm transition-all duration-300"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <DashboardFilters onFilterChange={setFilters} isLoading={loading} />
          </div>
        </div>
      </div>

      {/* Dashboard Body */}
      <div className="space-y-8 transition-all duration-500">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Principal"
            value={stats?.summary ? formatCurrency(stats.summary.total_loan_amount) : "..."}
            valueColor="text-gray-900 dark:text-white"
            growth={calculateGrowth('total_amount') || undefined}
            description="Total lending value"
            trendColor="#00E676"
            trendData={stats?.trends?.map(t => ({ value: t.total_amount }))}
          />
          <StatsCard
            title="Interest Collected"
            value={stats?.summary ? formatCurrency(stats.summary.interest_collected) : "..."}
            valueColor="text-gray-900 dark:text-white"
            growth={calculateGrowth('total_amount') || undefined} // Fallback to loan growth for now
            description="Total revenue earned"
            trendColor="#2979FF"
            trendData={stats?.trends?.map(t => ({ value: t.total_amount }))}
          />
          <StatsCard
            title="Total Pledges"
            value={stats?.summary ? stats.summary.total_pledges.toString() : "..."}
            valueColor="text-gray-900 dark:text-white"
            growth={calculateGrowth('count') || undefined}
            description="Tickets generated"
            trendColor="#FFAB00"
            trendData={stats?.trends?.map(t => ({ value: t.count }))}
          />
          <StatsCard
            title="Active Pledges"
            value={stats?.summary ? stats.summary.active_pledges.toString() : "..."}
            valueColor="text-gray-900 dark:text-white"
            growth={calculateGrowth('count') || undefined}
            description="Current portfolio"
            trendColor="#00E676"
            trendData={stats?.trends?.map(t => ({ value: t.count }))}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Report Card */}
          <div className="lg:col-span-2">
            <ReportCard
              title="Lending Report"
              chartData={stats?.trends || []}
              chartColor="#AA00FF"
              summaryStats={[
                {
                  label: 'Monthly',
                  value: stats?.summary ? formatCurrency(stats.summary.total_loan_amount / 12) : '...',
                  growth: calculateGrowth('total_amount') || '0%',
                  icon: 'star',
                  iconBg: 'bg-green-100',
                  iconColor: 'text-green-600'
                },
                {
                  label: 'Yearly',
                  value: stats?.summary ? formatCurrency(stats.summary.total_loan_amount) : '...',
                  growth: calculateGrowth('total_amount') || '0%',
                  icon: 'military_tech',
                  iconBg: 'bg-amber-100',
                  iconColor: 'text-amber-600'
                }
              ]}
              listItems={stats?.branch_distribution?.map(b => ({
                label: b.branch_name,
                value: formatCurrency(b.total_amount)
              })) || []}
            />
          </div>

          {/* Secondary Info / Status Distribution */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-[#1A1D1F] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Status Distribution</h3>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.status_distribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="count"
                      nameKey="status"
                      stroke="none"
                    >
                      {stats?.status_distribution?.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {stats?.status_distribution?.map((entry, index) => (
                  <div key={entry.status} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 capitalize">{entry.status}</span>
                    <span className="text-xs font-black text-gray-900 dark:text-white ml-auto">{entry.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showConfirm && (
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
      )}
    </div>
  );
};

export default AdminDashboard;
