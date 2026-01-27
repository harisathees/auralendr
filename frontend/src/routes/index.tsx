import React, { lazy } from "react";
import { Routes, Route, Navigate, useParams, useNavigate, Outlet } from "react-router-dom";
import ProtectedRoute from "../pages/Auth/Guards/ProtectedRoute";
import PublicRoute from "../pages/Auth/Guards/PublicRoute";
import RoleGuard from "../pages/Auth/Guards/RoleGuard";
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
const ClosePledge = lazy(() => import("../pages/Pledge/ClosePledge"));
const ApprovalConfirmation = lazy(() => import("../pages/Pledge/ApprovalConfirmation"));
const BranchList = lazy(() => import("../pages/Admin/Organization/Branch/List"));
const BranchForm = lazy(() => import("../pages/Admin/Organization/Branch/Form"));
const UsersList = lazy(() => import("../pages/Admin/Organization/User/List"));
const UserForm = lazy(() => import("../pages/Admin/Organization/User/Form"));
const CustomersList = lazy(() => import("../pages/Admin/Customer/List"));
const TasksList = lazy(() => import("../pages/Admin/Task/List"));
const LoansList = lazy(() => import("../pages/Admin/LoanConfiguration/LoanList"));
const AdminConfigs = lazy(() => import("../pages/Admin/Configs"));
const MoneySources = lazy(() => import("../pages/Admin/MoneySource/Index"));
const InterestSettings = lazy(() => import("../pages/Admin/LoanConfiguration/InterestRates"));
const ValidityPeriods = lazy(() => import("../pages/Admin/LoanConfiguration/LoanValidities"));
const ProcessingFees = lazy(() => import("../pages/Admin/LoanConfiguration/ProcessingFees"));
const BrandKit = lazy(() => import("../pages/Admin/Configs/BrandKit"));
const RepledgeSources = lazy(() => import("../pages/Admin/Finance/RepledgeSources"));

// Repledge Pages
const Notices = lazy(() => import("../pages/Staff/Notices/Notices"));
const Notifications = lazy(() => import("../pages/Staff/Notifications/Notifications"));
const RepledgeList = lazy(() => import("../pages/Repledge/List"));
const ReceiptTemplateList = lazy(() => import("../pages/Admin/Configs/Templates/Receipt/ReceiptTemplateList"));
const ReceiptLayoutSelector = lazy(() => import("../pages/Admin/Configs/Templates/Receipt/ReceiptLayoutSelector"));
const ReceiptDesigner = lazy(() => import("../pages/Admin/Configs/Templates/Receipt/ReceiptTemplateNew"));
const RepledgeCreate = lazy(() => import("../pages/Repledge/Create"));
const RepledgeEdit = lazy(() => import("../pages/Repledge/Edit"));
const RepledgeView = lazy(() => import("../pages/Repledge/View"));
const CloseRepledge = lazy(() => import("../pages/Repledge/CloseRepledge"));
const Privileges = lazy(() => import("../pages/Staff/Privileges/Privileges"));
const ActivityLog = lazy(() => import("../pages/Staff/Activities/ActivityLog"));

const MetalRates = lazy(() => import("../pages/Admin/Finance/MetalRates"));
const StaffMetalRates = lazy(() => import("../pages/Staff/Privileges/MetalRates"));
const JewelTypesIndex = lazy(() => import("../pages/Admin/JewelManagement/JewelTypes"));

const JewelTypeForm = lazy(() => import("../pages/Admin/JewelManagement/JewelTypeForm"));
const JewelQualitiesIndex = lazy(() => import("../pages/Admin/JewelManagement/JewelQualities"));
const JewelQualityForm = lazy(() => import("../pages/Admin/JewelManagement/JewelQualityForm"));
const JewelNamesIndex = lazy(() => import("../pages/Admin/JewelManagement/JewelNames"));
const JewelNameForm = lazy(() => import("../pages/Admin/JewelManagement/JewelNameForm"));
const InterestRateForm = lazy(() => import("../pages/Admin/LoanConfiguration/InterestRateForm"));
const ValidityPeriodForm = lazy(() => import("../pages/Admin/LoanConfiguration/LoanValidityForm"));
const RolesIndex = lazy(() => import("../pages/Developer/index"));
const CustomerAppControl = lazy(() => import("../pages/Developer/CustomerAppControl"));
const AdminProfile = lazy(() => import("../pages/Admin/Profile/AdminProfile"));
const AdminApprovals = lazy(() => import("../pages/Admin/Approvals/AdminApprovals"));

// Organization Configurations
const PledgeClosingCalculations = lazy(() => import("../pages/Admin/LoanConfiguration/Calculations/PledgeClosingCalculations"));
const RepledgeClosingCalculations = lazy(() => import("../pages/Admin/LoanConfiguration/Calculations/RepledgeClosingCalculations"));
const RepledgeProcessingFees = lazy(() => import("../pages/Admin/LoanConfiguration/Calculations/RepledgeProcessingFees"));

const TransactionCategories = lazy(() => import("../pages/Admin/Finance/TransactionCategories"));

const RedirectWithState = ({ to, param }: { to: string, param: string }) => {
  const params = useParams();
  const navigate = useNavigate();
  const value = params[param];

  React.useEffect(() => {
    if (value) {
      navigate(to, { replace: true, state: { [param]: value } });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [value, navigate, to, param]);

  return null;
};

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
        <Route path="/pledges/approval-pending" element={<ApprovalConfirmation />} />
        <Route path="/pledges/create" element={<Create />} />

        {/* URL Obfuscation: Generic Routes */}
        <Route path="/pledges/edit" element={<Edit />} />
        <Route path="/pledges/view" element={<View />} />
        <Route path="/pledges/receipt" element={<Receipt />} />
        <Route path="/pledges/close" element={<ClosePledge />} />

        {/* Redirect Routes (Capture ID -> Redirect to Generic) */}
        <Route path="/pledges/:id/edit" element={<RedirectWithState to="/pledges/edit" param="id" />} />
        <Route path="/pledges/:id/receipt" element={<RedirectWithState to="/pledges/receipt" param="id" />} />
        <Route path="/pledges/:id" element={<RedirectWithState to="/pledges/view" param="id" />} />
        <Route path="/pledges/:loanId/close" element={<RedirectWithState to="/pledges/close" param="loanId" />} />

        {/* Repledge Routes */}
        <Route path="/re-pledge" element={<RepledgeList />} />
        <Route path="/re-pledge/create" element={<RepledgeCreate />} />

        {/* Generic Routes */}
        <Route path="/re-pledge/edit" element={<RepledgeEdit />} />
        <Route path="/re-pledge/view" element={<RepledgeView />} />
        <Route path="/re-pledge/close" element={<CloseRepledge />} />

        {/* Redirect Routes */}
        <Route path="/re-pledge/:id/edit" element={<RedirectWithState to="/re-pledge/edit" param="id" />} />
        <Route path="/re-pledge/:id" element={<RedirectWithState to="/re-pledge/view" param="id" />} />
        <Route path="/re-pledge/:id/close" element={<RedirectWithState to="/re-pledge/close" param="id" />} />

        {/* Placeholder Routes for Staff Navigation */}
        <Route path="/notices" element={<Notices />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/privileges" element={<Privileges />} />
        <Route path="/privileges/metal-rates" element={<StaffMetalRates />} />
        <Route path="/activities" element={<ActivityLog />} />
      </Route>

      {/* Admin Routes */}
      <Route
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['admin', 'developer', 'superadmin']}>
              <AdminLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/approvals" element={<AdminApprovals />} />
        <Route
          element={
            <RoleGuard allowedRoles={['developer']}>
              <Outlet />
            </RoleGuard>
          }
        >
          <Route path="/admin/configs/branches" element={<BranchList />} />
          <Route path="/admin/configs/branches/create" element={<BranchForm />} />
          <Route path="/admin/configs/branches/edit" element={<BranchForm />} />
          <Route path="/admin/configs/branches/edit/:id" element={<RedirectWithState to="/admin/configs/branches/edit" param="id" />} />
        </Route>

        <Route path="/admin/configs/users" element={<UsersList />} />
        <Route path="/admin/configs/users/create" element={<UserForm />} />

        <Route path="/admin/configs/users/edit" element={<UserForm />} />
        <Route path="/admin/configs/users/edit/:id" element={<RedirectWithState to="/admin/configs/users/edit" param="id" />} />

        <Route path="/admin/loans" element={<LoansList />} />
        <Route path="/admin/customers" element={<CustomersList />} />

        <Route path="/admin/pledges/view" element={<View />} />
        <Route path="/admin/pledges/:id" element={<RedirectWithState to="/admin/pledges/view" param="id" />} />

        <Route path="/admin/cashflow" element={<TransactionHistory />} />

        <Route path="/admin/configs" element={<AdminConfigs />} />
        <Route
          element={
            <RoleGuard allowedRoles={['developer']}>
              <Outlet />
            </RoleGuard>
          }
        >
          <Route path="/admin/configs/brand-kit" element={<BrandKit />} />
        </Route>
        <Route path="/admin/configs/money-sources" element={<MoneySources />} />
        <Route path="/admin/configs/metal-rates" element={<MetalRates />} />
        <Route
          element={
            <RoleGuard allowedRoles={['developer']}>
              <Outlet />
            </RoleGuard>
          }
        >
          <Route path="/admin/configs/templates/receipt" element={<ReceiptTemplateList />} />
          <Route path="/admin/configs/templates/receipt/setup" element={<ReceiptLayoutSelector />} />
          <Route path="/admin/configs/templates/receipt/designer" element={<ReceiptDesigner />} />
        </Route>

        {/* Transaction Categories */}
        <Route path="/admin/configs/transaction-categories" element={<TransactionCategories />} />

        {/* Jewel Types */}
        <Route path="/admin/configs/jewel-types" element={<JewelTypesIndex />} />
        <Route path="/admin/configs/jewel-types/create" element={<JewelTypeForm />} />

        <Route path="/admin/configs/jewel-types/edit" element={<JewelTypeForm />} />
        <Route path="/admin/configs/jewel-types/edit/:id" element={<RedirectWithState to="/admin/configs/jewel-types/edit" param="id" />} />

        {/* Jewel Qualities */}
        <Route path="/admin/configs/jewel-qualities" element={<JewelQualitiesIndex />} />
        <Route path="/admin/configs/jewel-qualities/create" element={<JewelQualityForm />} />

        <Route path="/admin/configs/jewel-qualities/edit" element={<JewelQualityForm />} />
        <Route path="/admin/configs/jewel-qualities/edit/:id" element={<RedirectWithState to="/admin/configs/jewel-qualities/edit" param="id" />} />

        {/* Jewel Names */}
        <Route path="/admin/configs/jewel-names" element={<JewelNamesIndex />} />
        <Route path="/admin/configs/jewel-names/create" element={<JewelNameForm />} />

        <Route path="/admin/configs/jewel-names/edit" element={<JewelNameForm />} />
        <Route path="/admin/configs/jewel-names/edit/:id" element={<RedirectWithState to="/admin/configs/jewel-names/edit" param="id" />} />

        <Route path="/admin/configs/interest-settings" element={<InterestSettings />} />
        <Route path="/admin/configs/interest-settings/create" element={<InterestRateForm />} />

        <Route path="/admin/configs/interest-settings/edit" element={<InterestRateForm />} />
        <Route path="/admin/configs/interest-settings/edit/:id" element={<RedirectWithState to="/admin/configs/interest-settings/edit" param="id" />} />

        <Route path="/admin/configs/validity-periods" element={<ValidityPeriods />} />
        <Route path="/admin/configs/validity-periods/create" element={<ValidityPeriodForm />} />

        <Route path="/admin/configs/validity-periods/edit" element={<ValidityPeriodForm />} />
        <Route path="/admin/configs/validity-periods/edit/:id" element={<RedirectWithState to="/admin/configs/validity-periods/edit" param="id" />} />
        <Route path="/admin/configs/processing-fees" element={<ProcessingFees />} />
        <Route path="/admin/configs/repledge-sources" element={<RepledgeSources />} />

        {/* Developer - Privileges */}
        <Route path="/admin/configs/roles" element={<RolesIndex />} />
        <Route path="/admin/developer/customer-app" element={<CustomerAppControl />} />
        <Route path="/admin/activities" element={<ActivityLog />} />


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
