import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";
import Login from "../pages/login/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import List from "../pages/Pledges/List";
import Create from "../pages/Pledges/Create";
import Edit from "../pages/Pledges/Edit";
import View from "../pages/Pledges/View";
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes - redirect to dashboard if already logged in */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route path="/login" element={<Navigate to="/" replace />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

{/*       
    <Route path="/pledges" element={<ProtectedRoute><List /></ProtectedRoute>} />
      <Route path="/pledges/create" element={<ProtectedRoute><Create /></ProtectedRoute>} />
      <Route path="/pledges/:id/edit" element={<ProtectedRoute><Edit /></ProtectedRoute>} />
      <Route path="/pledges/:id" element={<ProtectedRoute><View /></ProtectedRoute>} /> */}
      <Route path="/pledges" element={<List />} />
      <Route path="/pledges/create" element={<Create />} />
      <Route path="/pledges/:id/edit" element={<Edit />} />
      <Route path="/pledges/:id" element={<View />} />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

