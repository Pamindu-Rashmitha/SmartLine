import React from 'react';
import { Layout, Dropdown, Avatar } from 'antd';
import {
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from '../components/common/NotificationBell';

const { Header } = Layout;

const ROLE_COLORS = {
  ADMIN: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  SENIOR_MANAGER: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  CREDIT_MANAGER: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  LOAN_OFFICER: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  FIELD_OFFICER: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  LEGAL_OFFICER: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  FINANCE_OFFICER: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  CREDIT_CONTROL_OFFICER: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  APPLICANT: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
};

const AppHeader = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();

  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <div className="px-2 py-1.5">
          <p className="font-semibold text-slate-200">{user?.fullName}</p>
          <p className="text-xs text-slate-400">{user?.email}</p>
          <div className="mt-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ROLE_COLORS[user?.role] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
              {user?.role?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogOut className="w-4 h-4 text-rose-400" />,
      label: <span className="text-rose-400 font-medium">Log out</span>,
      onClick: logout,
    },
  ];

  return (
    <Header className="sticky top-0 z-20 flex items-center justify-end px-6 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 h-16 leading-none">
      <div className="flex items-center gap-4 ml-auto">
        {/* Real-time Notification Bell */}
        <NotificationBell />

        {/* User profile dropdown */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <div className="flex items-center gap-3 pl-3 py-1 cursor-pointer border-l border-slate-800 hover:opacity-90 transition-opacity">
            <Avatar
              size={36}
              className="bg-gradient-to-tr from-blue-600 to-indigo-500 font-semibold text-white shadow-md"
            >
              {user?.fullName?.charAt(0) || 'U'}
            </Avatar>
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold text-slate-200 leading-tight truncate max-w-[150px]">
                {user?.fullName || 'User'}
              </div>
              <div className="text-[11px] font-medium text-blue-400 leading-tight">
                {user?.role?.replace(/_/g, ' ')}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;
