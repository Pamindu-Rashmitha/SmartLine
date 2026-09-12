import React from 'react';
import { Layout, Dropdown, Avatar } from 'antd';
import {
  LogOut,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import NotificationBell from '../components/common/NotificationBell';

const { Header } = Layout;

const ROLE_COLORS = {
  ADMIN: 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
  SENIOR_MANAGER: 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30',
  CREDIT_MANAGER: 'bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
  LOAN_OFFICER: 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
  FIELD_OFFICER: 'bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-500/30',
  LEGAL_OFFICER: 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
  FINANCE_OFFICER: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
  CREDIT_CONTROL_OFFICER: 'bg-orange-50 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/30',
  APPLICANT: 'bg-sky-50 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-500/30',
};

const AppHeader = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <div className="px-2 py-1.5">
          <p className="font-semibold text-slate-800 dark:text-slate-200">{user?.fullName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
          <div className="mt-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ROLE_COLORS[user?.role] || 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'}`}>
              {user?.role?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogOut className="w-4 h-4 text-rose-500" />,
      label: <span className="text-rose-500 font-medium">Log out</span>,
      onClick: logout,
    },
  ];

  return (
    <Header className="sticky top-0 z-20 flex items-center justify-end px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 leading-none transition-colors duration-200 shadow-sm">
      <div className="flex items-center gap-4 ml-auto">
        {/* Dark / Light Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500/50 shadow-sm transition-all cursor-pointer flex items-center justify-center"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Real-time Notification Bell */}
        <NotificationBell />

        {/* User profile dropdown */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <div className="flex items-center gap-3 pl-3 py-1 cursor-pointer border-l border-slate-200 dark:border-slate-800 hover:opacity-90 transition-opacity">
            <Avatar
              size={36}
              className="bg-gradient-to-tr from-blue-600 to-indigo-500 font-semibold text-white shadow-md"
            >
              {user?.fullName?.charAt(0) || 'U'}
            </Avatar>
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[150px]">
                {user?.fullName || 'User'}
              </div>
              <div className="text-[11px] font-medium text-blue-600 dark:text-blue-400 leading-tight">
                {user?.role?.replace(/_/g, ' ')}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;
