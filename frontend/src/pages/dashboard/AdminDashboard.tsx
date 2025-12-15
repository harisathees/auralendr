import { useAuth } from "../../context/AuthContext";
import MetalRatesCard from "../../components/Dashboard/MetalRatesCard";

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Admin Dashboard</h2>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Metal Rates Card */}
        <div className="col-span-1">
          <MetalRatesCard />
        </div>

        {/* Placeholder for other widgets */}
        <div className="col-span-1 md:col-span-2 bg-white dark:bg-card-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <p className="text-gray-500">Other dashboard widgets coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;