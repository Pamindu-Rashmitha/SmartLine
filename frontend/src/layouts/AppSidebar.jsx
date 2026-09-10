import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  FolderLock,
  Users,
  CheckSquare,
  MapPin,
  ClipboardList,
  ShieldCheck,
  Scale,
  DollarSign,
  AlertCircle,
  Settings,
  Briefcase,
  Layers,
  Banknote,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const { Sider } = Layout;

// Menu configuration per role
const ROLE_MENUS = {
  APPLICANT: [
    { key: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'My Dashboard' },
    { key: '/applications/new', icon: <FileText className="w-4 h-4" />, label: 'Apply for Loan' },
    { key: '/applications', icon: <CreditCard className="w-4 h-4" />, label: 'My Applications' },
    { key: '/my-repayments', icon: <Banknote className="w-4 h-4" />, label: 'Repayments & Dues' },
    { key: '/documents', icon: <FolderLock className="w-4 h-4" />, label: 'Document Vault' },
  ],
  LOAN_OFFICER: [
    { key: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Officer Dashboard' },
    { key: '/applications', icon: <FileText className="w-4 h-4" />, label: 'Loan Pipeline' },
    { key: '/customers', icon: <Users className="w-4 h-4" />, label: 'Applicant Directory' },
    { key: '/calculator', icon: <CreditCard className="w-4 h-4" />, label: 'Loan Calculator' },
  ],
  FIELD_OFFICER: [
    { key: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Field Dashboard' },
    { key: '/field-visits', icon: <MapPin className="w-4 h-4" />, label: 'Assigned Visits' },
    { key: '/verifications', icon: <ClipboardList className="w-4 h-4" />, label: 'Site Inspection Reports' },
  ],
  CREDIT_MANAGER: [
    { key: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Credit Dashboard' },
    { key: '/underwriting', icon: <CheckSquare className="w-4 h-4" />, label: 'Underwriting Queue' },
    { key: '/credit-assessment', icon: <ShieldCheck className="w-4 h-4" />, label: 'CRIB & Risk Scoring' },
  ],
  SENIOR_MANAGER: [
    { key: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Executive Overview' },
    { key: '/approvals', icon: <CheckSquare className="w-4 h-4" />, label: 'High-Value Sanctions' },
    { key: '/portfolio', icon: <Layers className="w-4 h-4" />, label: 'Portfolio Analytics' },
  ],
  LEGAL_OFFICER: [
    { key: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Legal Dashboard' },
    { key: '/legal-agreements', icon: <Scale className="w-4 h-4" />, label: 'Contracts & Deeds' },
    { key: '/compliance', icon: <ShieldCheck className="w-4 h-4" />, label: 'Compliance Checks' },
  ],
  FINANCE_OFFICER: [
    { key: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Disbursement Desk' },
    { key: '/disbursements', icon: <DollarSign className="w-4 h-4" />, label: 'Fund Transfers' },
    { key: '/facilities', icon: <Banknote className="w-4 h-4" />, label: 'Active Facilities' },
  ],
  CREDIT_CONTROL_OFFICER: [
    { key: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Recovery Overview' },
    { key: '/arrears', icon: <AlertCircle className="w-4 h-4" />, label: 'Delinquent Accounts' },
    { key: '/follow-ups', icon: <ClipboardList className="w-4 h-4" />, label: 'Recovery Actions' },
  ],
  ADMIN: [
    { key: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Admin Dashboard' },
    { key: '/users', icon: <Users className="w-4 h-4" />, label: 'User Directory' },
    { key: '/applications', icon: <FileText className="w-4 h-4" />, label: 'All Applications' },
    { key: '/settings', icon: <Settings className="w-4 h-4" />, label: 'System Settings' },
  ],
};

const AppSidebar = ({ collapsed }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = (user?.role && ROLE_MENUS[user.role]) ? ROLE_MENUS[user.role] : ROLE_MENUS.APPLICANT;

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={260}
      collapsedWidth={80}
      className="h-screen sticky top-0 left-0 bg-slate-900 border-r border-slate-800 z-30 flex flex-col justify-between"
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-600/30 flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-white"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        {!collapsed && (
          <div className="overflow-hidden transition-all">
            <h1 className="text-base font-bold text-white tracking-tight leading-none m-0">
              SMART LINE
            </h1>
            <p className="text-[11px] font-semibold text-blue-400 tracking-wider uppercase mt-1 mb-0 leading-none">
              Loan & Leasing Suite
            </p>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="py-4 flex-1 overflow-y-auto">
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            onClick: () => navigate(item.key),
          }))}
          className="border-r-0 bg-transparent text-slate-300 font-medium text-sm"
        />
      </div>

      {/* Role Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Phase 5: EP04 Ready</span> v1.0.0
            </div>
          </div>
        </div>
      )}
    </Sider>
  );
};

export default AppSidebar;
