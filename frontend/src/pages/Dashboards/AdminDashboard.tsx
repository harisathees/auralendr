import { useAuth } from "../../context/Auth/AuthContext";
import { useTheme } from "../../context/Theme/ThemeContext";
import DashboardFilters from "../../components/Dashboard/DashboardFilters";
import { LogOut, Sun, Moon, LayoutDashboard, Repeat, BarChart3, User, Camera, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import LoansDashboard from "./LoansDashboard";
import RepledgeDashboard from "./RepledgeDashboard";
import BusinessOverviewDashboard from "./BusinessOverviewDashboard";
import api from "../../api/apiClient";
import { toast } from "react-hot-toast";
import { compressImage } from "../../utils/imageCompression";

type Tab = 'loans' | 'repledge' | 'business';

const AdminDashboard: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<Tab>('business');
  const [showMenu, setShowMenu] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
          <button
            onClick={() => setActiveTab('repledge')}
            className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'repledge'
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
          >
            <Repeat className="w-4 h-4" />
            Repledge
          </button>
        </div>
      </div>

      {/* Dashboard Body */}
      {activeTab === 'business' ? (
        <BusinessOverviewDashboard filters={filters} />
      ) : activeTab === 'loans' ? (
        <LoansDashboard filters={filters} />
      ) : (
        <RepledgeDashboard filters={filters} />
      )}

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
