import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardLayout from '../layouts/DashboardLayout';
import RoleDashboardHub from '../pages/dashboard/RoleDashboardHub';
import ProtectedRoute from '../components/common/ProtectedRoute';

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
        <Route path="applications/*" element={<RoleDashboardHub />} />
        <Route path="loans/*" element={<RoleDashboardHub />} />
        <Route path="documents/*" element={<RoleDashboardHub />} />
        <Route path="customers/*" element={<RoleDashboardHub />} />
        <Route path="field-visits/*" element={<RoleDashboardHub />} />
        <Route path="underwriting/*" element={<RoleDashboardHub />} />
        <Route path="approvals/*" element={<RoleDashboardHub />} />
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
