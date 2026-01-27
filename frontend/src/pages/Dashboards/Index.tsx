import { useAuth } from "../../context/Auth/AuthContext";
import AdminDashboard from "./AdminDashboard";
import StaffDashboard from "./StaffDashboard";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      {user?.role === "admin" || user?.role === "developer" ? <AdminDashboard /> : <StaffDashboard />}
    </>
  );
};
export default Dashboard;
