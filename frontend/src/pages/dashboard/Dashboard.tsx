import { useAuth } from "../../context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import StaffDashboard from "./StaffDashboard";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      {user?.role === "admin" ? <AdminDashboard /> : <StaffDashboard />}
    </>
  );
};
export default Dashboard;
