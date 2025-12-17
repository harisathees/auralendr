import React, { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";
import Login from "../pages/login/Login";
import DashboardLayout from "../layouts/DashboardLayout";
import AdminLayout from "../layouts/AdminLayout";

// Lazy load dashboard pages to enable transition animations
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const TransactionHistory = lazy(() => import("../pages/dashboard/TransactionHistory")); // Added TransactionHistory
const List = lazy(() => import("../pages/Pledges/List"));
const Create = lazy(() => import("../pages/Pledges/Create"));
const Edit = lazy(() => import("../pages/Pledges/Edit"));
const View = lazy(() => import("../pages/Pledges/View"));
const Receipt = lazy(() => import("../pages/Pledges/Receipt"));
const BranchList = lazy(() => import("../pages/dashboard/admin/configs/Branches/List"));
const UsersList = lazy(() => import("../pages/dashboard/admin/configs/Users/List"));
const CustomersList = lazy(() => import("../pages/admin/Customers/List"));
const TasksList = lazy(() => import("../pages/admin/Tasks/List"));
const LoansList = lazy(() => import("../pages/admin/Loans/List"));
const AdminConfigs = lazy(() => import("../pages/dashboard/admin/configs/index"));
const MoneySources = lazy(() => import("../pages/dashboard/admin/configs/MoneySources"));
const InterestSettings = lazy(() => import("../pages/dashboard/admin/configs/InterestSettings"));
const ValidityPeriods = lazy(() => import("../pages/dashboard/admin/configs/ValidityPeriods"));
const ProcessingFees = lazy(() => import("../pages/dashboard/admin/configs/ProcessingFees"));
const RepledgeSources = lazy(() => import("../pages/dashboard/admin/configs/RepledgeSources"));

// Repledge Pages
const RepledgeList = lazy(() => import("../pages/Repledge/List"));
const RepledgeCreate = lazy(() => import("../pages/Repledge/Create"));
const RepledgeEdit = lazy(() => import("../pages/Repledge/Edit"));
const RepledgeView = lazy(() => import("../pages/Repledge/View"));

const MetalRates = lazy(() => import("../pages/dashboard/admin/configs/MetalRates"));
const JewelTypesIndex = lazy(() => import("../pages/dashboard/admin/configs/JewelTypes"));

const JewelTypeForm = lazy(() => import("../pages/dashboard/admin/configs/JewelTypeForm"));
const JewelQualitiesIndex = lazy(() => import("../pages/dashboard/admin/configs/JewelQualities"));
const JewelQualityForm = lazy(() => import("../pages/dashboard/admin/configs/JewelQualityForm"));
const JewelNamesIndex = lazy(() => import("../pages/dashboard/admin/configs/JewelNames"));
const JewelNameForm = lazy(() => import("../pages/dashboard/admin/configs/JewelNameForm"));
const InterestRateForm = lazy(() => import("../pages/dashboard/admin/configs/InterestRateForm"));
const ValidityPeriodForm = lazy(() => import("../pages/dashboard/admin/configs/ValidityPeriodForm"));

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
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<TransactionHistory />} /> // Added route

        {/* Repledge Routes */}
        <Route path="/pledges" element={<List />} />
        <Route path="/pledges/create" element={<Create />} />
        <Route path="/pledges/:id/edit" element={<Edit />} />
        <Route path="/pledges/:id/receipt" element={<Receipt />} />
        <Route path="/pledges/:id" element={<View />} />
      </Route>

      {/* Repledge Routes */}
      <Route path="/re-pledge" element={<RepledgeList />} />
      <Route path="/re-pledge/create" element={<RepledgeCreate />} />
      <Route path="/re-pledge/:id/edit" element={<RepledgeEdit />} />
      <Route path="/re-pledge/:id" element={<RepledgeView />} />


      {/* Admin Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/configs/branches" element={<BranchList />} />
        <Route path="/admin/configs/users" element={<UsersList />} />
        <Route path="/admin/loans" element={<LoansList />} />
        <Route path="/admin/customers" element={<CustomersList />} />
        <Route path="/admin/pledges/:id" element={<View />} />

        {/* Configurations */}
        <Route path="/admin/configurations" element={<Navigate to="/admin/configs" replace />} />
        <Route path="/admin/configs" element={<AdminConfigs />} />
        <Route path="/admin/configs/money-sources" element={<MoneySources />} />
        <Route path="/admin/configs/metal-rates" element={<MetalRates />} />

        {/* Jewel Types */}
        <Route path="/admin/configs/jewel-types" element={<JewelTypesIndex />} />
        <Route path="/admin/configs/jewel-types/create" element={<JewelTypeForm />} />
        <Route path="/admin/configs/jewel-types/edit/:id" element={<JewelTypeForm />} />

        {/* Jewel Qualities */}
        <Route path="/admin/configs/jewel-qualities" element={<JewelQualitiesIndex />} />
        <Route path="/admin/configs/jewel-qualities/create" element={<JewelQualityForm />} />
        <Route path="/admin/configs/jewel-qualities/edit/:id" element={<JewelQualityForm />} />

        {/* Jewel Names */}
        <Route path="/admin/configs/jewel-names" element={<JewelNamesIndex />} />
        <Route path="/admin/configs/jewel-names/create" element={<JewelNameForm />} />
        <Route path="/admin/configs/jewel-names/edit/:id" element={<JewelNameForm />} />
        <Route path="/admin/configs/interest-settings" element={<InterestSettings />} />
        <Route path="/admin/configs/interest-settings/create" element={<InterestRateForm />} />
        <Route path="/admin/configs/interest-settings/edit/:id" element={<InterestRateForm />} />
        <Route path="/admin/configs/validity-periods" element={<ValidityPeriods />} />
        <Route path="/admin/configs/validity-periods/create" element={<ValidityPeriodForm />} />
        <Route path="/admin/configs/validity-periods/edit/:id" element={<ValidityPeriodForm />} />
        <Route path="/admin/configs/processing-fees" element={<ProcessingFees />} />
        <Route path="/admin/configs/repledge-sources" element={<RepledgeSources />} />

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
