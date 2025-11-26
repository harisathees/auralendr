import { useAuth } from "../../context/AuthContext";

const StaffDashboard = () => {
  const { logout } = useAuth();

  return (
    <div>
      <h2>Staff Dashboard — Branch Section Only</h2>
      <button onClick={logout}>Logout</button>
      {/* Later → customer & pledge modules */}
    </div>
  );
};

export default StaffDashboard;
