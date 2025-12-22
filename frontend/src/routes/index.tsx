import React, { lazy } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import ProtectedRoute from "../pages/Auth/Guards/ProtectedRoute";
import PublicRoute from "../pages/Auth/Guards/PublicRoute";
import Login from "../pages/Auth/Login/Login";
import DashboardLayout from "../layouts/DashboardLayout";
import AdminLayout from "../layouts/AdminLayout";

// Lazy load dashboard pages to enable transition animations
const Dashboard = lazy(() => import("../pages/Dashboards/Index"));
const TransactionHistory = lazy(() => import("../pages/Transaction/History"));
const TransactionForm = lazy(() => import("../pages/Transaction/Create"));
const List = lazy(() => import("../pages/Pledge/List"));
const Create = lazy(() => import("../pages/Pledge/Create"));
const Edit = lazy(() => import("../pages/Pledge/Edit"));
const View = lazy(() => import("../pages/Pledge/View"));
const Receipt = lazy(() => import("../pages/Pledge/Receipt"));
const BranchList = lazy(() => import("../pages/Admin/Organization/Branch/List"));
const UsersList = lazy(() => import("../pages/Admin/Organization/User/List"));
const CustomersList = lazy(() => import("../pages/Admin/Customer/List"));
const TasksList = lazy(() => import("../pages/Admin/Task/List"));
const LoansList = lazy(() => import("../pages/Admin/LoanConfiguration/LoanList"));
const AdminConfigs = lazy(() => import("../pages/Admin/Configs"));
const MoneySources = lazy(() => import("../pages/Admin/MoneySource/Index"));
const InterestSettings = lazy(() => import("../pages/Admin/LoanConfiguration/InterestRates"));
const ValidityPeriods = lazy(() => import("../pages/Admin/LoanConfiguration/LoanValidities"));
const ProcessingFees = lazy(() => import("../pages/Admin/LoanConfiguration/ProcessingFees"));
const RepledgeSources = lazy(() => import("../pages/Admin/Finance/RepledgeSources"));

// Repledge Pages
const Notices = lazy(() => import("../pages/Staff/Notices/Notices"));
const RepledgeList = lazy(() => import("../pages/Repledge/List"));
const RepledgeCreate = lazy(() => import("../pages/Repledge/Create"));
const RepledgeEdit = lazy(() => import("../pages/Repledge/Edit"));
const RepledgeView = lazy(() => import("../pages/Repledge/View"));

const MetalRates = lazy(() => import("../pages/Admin/Finance/MetalRates"));
const JewelTypesIndex = lazy(() => import("../pages/Admin/JewelManagement/JewelTypes"));

const JewelTypeForm = lazy(() => import("../pages/Admin/JewelManagement/JewelTypeForm"));
const JewelQualitiesIndex = lazy(() => import("../pages/Admin/JewelManagement/JewelQualities"));
const JewelQualityForm = lazy(() => import("../pages/Admin/JewelManagement/JewelQualityForm"));
const JewelNamesIndex = lazy(() => import("../pages/Admin/JewelManagement/JewelNames"));
const JewelNameForm = lazy(() => import("../pages/Admin/JewelManagement/JewelNameForm"));
const InterestRateForm = lazy(() => import("../pages/Admin/LoanConfiguration/InterestRateForm"));
const ValidityPeriodForm = lazy(() => import("../pages/Admin/LoanConfiguration/LoanValidityForm"));
const RolesIndex = lazy(() => import("../pages/Developer/index"));

// Organization Configurations
const PledgeClosingCalculations = lazy(() => import("../pages/Admin/LoanConfiguration/Calculations/PledgeClosingCalculations"));
const RepledgeClosingCalculations = lazy(() => import("../pages/Admin/LoanConfiguration/Calculations/RepledgeClosingCalculations"));
const RepledgeProcessingFees = lazy(() => import("../pages/Admin/LoanConfiguration/Calculations/RepledgeProcessingFees"));

const TransactionCategories = lazy(() => import("../pages/Admin/Finance/TransactionCategories"));
const TransactionCategoryForm = lazy(() => import("../pages/Admin/Finance/TransactionCategoryForm"));

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
        <Route path="/transactions/create" element={<TransactionForm />} />

        {/* Repledge Routes */}
        <Route path="/pledges" element={<List />} />
        <Route path="/pledges/create" element={<Create />} />
        <Route path="/pledges/:id/edit" element={<Edit />} />
        <Route path="/pledges/:id/receipt" element={<Receipt />} />
        <Route path="/pledges/:id" element={<View />} />

        {/* Repledge Routes */}
        <Route path="/re-pledge" element={<RepledgeList />} />
        <Route path="/re-pledge/create" element={<RepledgeCreate />} />
        <Route path="/re-pledge/:id/edit" element={<RepledgeEdit />} />
        <Route path="/re-pledge/:id" element={<RepledgeView />} />

        {/* Placeholder Routes for Staff Navigation */}

        {/* Placeholder Routes for Staff Navigation */}
        <Route path="/notices" element={<Notices />} />
        <Route path="/privileges" element={
          <div className="p-8 flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
            <h1 className="text-2xl font-bold mb-6">User Privileges</h1>
            <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
              <Link to="/notices" className="flex items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-primary transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">print</span>
                </div>
                <div>
                  <h3 className="font-bold">Notice Printing</h3>
                  <p className="text-sm text-gray-500">Generate and print loan notices</p>
                </div>
              </Link>
              <div className="flex items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 opacity-50">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined">person_pin</span>
                </div>
                <div>
                  <h3 className="font-bold">Role Management</h3>
                  <p className="text-sm text-gray-500">Manage user roles (Coming soon)</p>
                </div>
              </div>
            </div>
          </div>
        } />
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
        <Route path="/admin/configs/branches" element={<BranchList />} />
        <Route path="/admin/configs/users" element={<UsersList />} />
        <Route path="/admin/loans" element={<LoansList />} />
        <Route path="/admin/customers" element={<CustomersList />} />
        <Route path="/admin/pledges/:id" element={<View />} />

        <Route path="/admin/configs" element={<AdminConfigs />} />
        <Route path="/admin/configs/money-sources" element={<MoneySources />} />
        <Route path="/admin/configs/metal-rates" element={<MetalRates />} />

        {/* Transaction Categories */}
        <Route path="/admin/configs/transaction-categories" element={<TransactionCategories />} />
        <Route path="/admin/configs/transaction-categories/create" element={<TransactionCategoryForm />} />
        <Route path="/admin/configs/transaction-categories/edit/:id" element={<TransactionCategoryForm />} />

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

        {/* Developer - Privileges */}
        <Route path="/admin/configs/roles" element={<RolesIndex />} />

        {/* Organization - Calculations */}
        <Route path="/admin/configs/pledge-closing-calculations" element={<PledgeClosingCalculations />} />
        <Route path="/admin/configs/repledge-closing-calculations" element={<RepledgeClosingCalculations />} />
        <Route path="/admin/configs/repledge-processing-fees" element={<RepledgeProcessingFees />} />

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
