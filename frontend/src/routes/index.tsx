import React, { lazy } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";
import Login from "../pages/login/Login";
import DashboardLayout from "../layouts/DashboardLayout";
import AdminLayout from "../layouts/AdminLayout";

// Lazy load dashboard pages to enable transition animations
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const List = lazy(() => import("../pages/Pledges/List"));
const Create = lazy(() => import("../pages/Pledges/Create"));
const Edit = lazy(() => import("../pages/Pledges/Edit"));
const View = lazy(() => import("../pages/Pledges/View"));
const BranchList = lazy(() => import("../pages/admin/Branches/List"));
const UsersList = lazy(() => import("../pages/admin/Users/List"));
const TasksList = lazy(() => import("../pages/admin/Tasks/List"));

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

      {/* Protected Routes wrapped in DashboardLayout */}
      {/* Protected Routes wrapped in DashboardLayout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pledges" element={<List />} />
        <Route path="/pledges/create" element={<Create />} />
        <Route path="/pledges/:id/edit" element={<Edit />} />
        <Route path="/pledges/:id" element={<View />} />
      </Route>


      {/* Admin Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/branches" element={<BranchList />} />
        <Route path="/admin/users" element={<UsersList />} />
        <Route path="/admin/configurations" element={<div>Configurations Page (Placeholder)</div>} />
        {/* FAB Action Routes (if they are pages) */}
        <Route path="/admin/analysis" element={<div>Advanced Analysis Page (Placeholder)</div>} />
        <Route path="/admin/tasks" element={<TasksList />} />
      </Route>

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

