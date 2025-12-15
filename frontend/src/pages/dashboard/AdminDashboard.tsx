import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import MetalRatesCard from "../../components/Dashboard/MetalRatesCard";
import StatsCard from "../../components/Dashboard/StatsCard";

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#00E676] transition-colors duration-300">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Welcome back, Admin</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#1A1D1F] flex items-center justify-center border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-sm transition-all duration-300"
          >
            <span className="material-symbols-outlined">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          {/* Profile */}
          <div className="w-10 h-10 rounded-full bg-[#FDB931] flex items-center justify-center text-black font-bold border-2 border-white dark:border-[#1A1D1F] overflow-hidden shadow-md">
            <img src="https://ui-avatars.com/api/?name=Admin&background=FDB931&color=000" alt="Admin" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Metal Rates Card */}
        <div className="lg:col-span-2">
          <MetalRatesCard />
        </div>

        {/* Right Column (Placeholder or extended stats) */}
        <div className="hidden lg:block lg:col-span-1">
          {/* Optional: Add a quick action or mini-calendar here later */}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="col-span-1">
          <StatsCard
            title="Total Users"
            value="120"
            valueColor="text-[#00E676]"
            icon="group"
          />
        </div>

        {/* Pending Approvals */}
        <div className="col-span-1">
          <StatsCard
            title="Pending Approvals"
            value="5"
            valueColor="text-[#FFAB00]"
            icon="pending_actions"
          />
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;