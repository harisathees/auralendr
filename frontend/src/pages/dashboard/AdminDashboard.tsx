import { useAuth } from "../../context/AuthContext";

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div>
      <h2 className="text-red-500">Admin Dashboard</h2>
      <button onClick={logout}>Logout</button>
      {/* Later → branch list, customers, pledges, staff mgmt */}
    </div>
  );
};

export default AdminDashboard;