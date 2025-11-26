import { useAuth } from "../../context/AuthContext";
import AdminDashboard from "../dashboard/AdminDashboard";
import StaffDashboard from "../dashboard/StaffDashboard";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <>
      {user?.role === "admin" ? <AdminDashboard /> : <StaffDashboard />}
    </>
  );
};
export default Dashboard;
