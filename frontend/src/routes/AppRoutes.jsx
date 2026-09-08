import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardLayout from '../layouts/DashboardLayout';
import RoleDashboardHub from '../pages/dashboard/RoleDashboardHub';
import ProtectedRoute from '../components/common/ProtectedRoute';
import ApplyLoanPage from '../pages/applicant/ApplyLoanPage';
import MyApplicationsPage from '../pages/applicant/MyApplicationsPage';
import ApplicationDetailPage from '../pages/applicant/ApplicationDetailPage';
import LoanPipelinePage from '../pages/loan-officer/LoanPipelinePage';
import ApplicationReviewPage from '../pages/loan-officer/ApplicationReviewPage';
import CreditQueuePage from '../pages/credit-manager/CreditQueuePage';
import CreditAssessmentPage from '../pages/credit-manager/CreditAssessmentPage';
import InspectionQueuePage from '../pages/field-officer/InspectionQueuePage';
import VehicleInspectionPage from '../pages/field-officer/VehicleInspectionPage';
import AuthorizationQueuePage from '../pages/senior-manager/AuthorizationQueuePage';
import AuthorizationDetailPage from '../pages/senior-manager/AuthorizationDetailPage';
import { useAuth } from '../contexts/AuthContext';

// Dispatcher for /applications index route
const ApplicationsIndexDispatcher = () => {
  const { user } = useAuth();
  if (user?.role === 'APPLICANT') {
    return <MyApplicationsPage />;
  }
  if (user?.role === 'CREDIT_MANAGER') {
    return <CreditQueuePage />;
  }
  if (user?.role === 'FIELD_OFFICER') {
    return <InspectionQueuePage />;
  }
  if (user?.role === 'SENIOR_MANAGER') {
    return <AuthorizationQueuePage />;
  }
  return <LoanPipelinePage />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Dashboard & Operations Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<RoleDashboardHub />} />

        {/* EP01: Application Intake & Verification Routes */}
        <Route path="applications/new" element={<ApplyLoanPage />} />
        <Route path="applications" element={<ApplicationsIndexDispatcher />} />
        <Route path="applications/:id" element={<ApplicationDetailPage />} />
        <Route path="applications/:id/verify" element={<ApplicationReviewPage />} />

        {/* EP02: Credit Assessment & Risk Evaluation Routes */}
        <Route path="underwriting" element={<CreditQueuePage />} />
        <Route path="credit-assessment" element={<CreditQueuePage />} />
        <Route path="applications/:id/assess" element={<CreditAssessmentPage />} />

        {/* EP02: Field Inspection Routes */}
        <Route path="field-visits" element={<InspectionQueuePage />} />
        <Route path="verifications" element={<InspectionQueuePage />} />
        <Route path="applications/:id/inspect" element={<VehicleInspectionPage />} />

        {/* EP02: Senior Manager Higher-Level Sanction Routes */}
        <Route path="approvals" element={<AuthorizationQueuePage />} />
        <Route path="applications/:id/authorize" element={<AuthorizationDetailPage />} />

        {/* Role-Specific Pipeline Direct Aliases */}
        <Route path="loan-officer/applications" element={<LoanPipelinePage />} />
        <Route path="loans" element={<ApplicationsIndexDispatcher />} />
        <Route path="loans/*" element={<RoleDashboardHub />} />
        <Route path="documents/*" element={<RoleDashboardHub />} />
        <Route path="customers/*" element={<RoleDashboardHub />} />
        <Route path="legal-agreements/*" element={<RoleDashboardHub />} />
        <Route path="disbursements/*" element={<RoleDashboardHub />} />
        <Route path="arrears/*" element={<RoleDashboardHub />} />
        <Route path="users/*" element={<RoleDashboardHub />} />
        <Route path="settings/*" element={<RoleDashboardHub />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
