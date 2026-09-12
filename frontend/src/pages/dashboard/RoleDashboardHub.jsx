import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Select, Skeleton, Alert, Tag } from 'antd';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  Users,
  ShieldAlert,
  ArrowRight,
  Plus,
  Compass,
  DollarSign,
  Scale,
  FolderLock,
  RefreshCw,
  Eye,
  ExternalLink,
  Banknote,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import dashboardApi from '../../api/dashboardApi';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import DistributionChart from '../../components/dashboard/DistributionChart';
import RecentActivityFeed from '../../components/dashboard/RecentActivityFeed';
import dayjs from 'dayjs';

const ICON_MAP = {
  FileText,
  CreditCard,
  Clock,
  TrendingUp,
  CheckCircle2,
  Compass,
  ShieldAlert,
  Scale,
  DollarSign,
  AlertCircle,
  FolderLock,
  Users,
};

const ALL_ROLES = [
  'APPLICANT',
  'LOAN_OFFICER',
  'FIELD_OFFICER',
  'CREDIT_MANAGER',
  'SENIOR_MANAGER',
  'LEGAL_OFFICER',
  'FINANCE_OFFICER',
  'CREDIT_CONTROL_OFFICER',
  'ADMIN',
];

const RoleDashboardHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(user?.role || 'APPLICANT');

  const effectiveRole = user?.role === 'ADMIN' ? selectedRole : (user?.role || 'APPLICANT');
  const hasRightColumn = effectiveRole === 'ADMIN' || effectiveRole === 'APPLICANT';

  // TanStack Query for dynamic dashboard stats
  const {
    data: stats,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dashboardStats', effectiveRole],
    queryFn: () => dashboardApi.getStats(effectiveRole === user?.role ? null : effectiveRole),
    staleTime: 30000,
  });

  const kpiCards = stats?.kpiCards || [];
  const statusDistribution = stats?.statusDistribution || {};
  const typeDistribution = stats?.typeDistribution || {};
  const roleDistribution = stats?.roleDistribution || {};
  const recentApplications = stats?.recentApplications || [];
  const recentInstallments = stats?.recentInstallments || [];
  const recentAuditLogs = stats?.recentAuditLogs || [];

  // Helper to format currency
  const formatLkr = (val) => {
    if (val == null) return 'LKR 0.00';
    return `LKR ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Primary action button handler based on role
  const handlePrimaryAction = () => {
    switch (effectiveRole) {
      case 'APPLICANT':
        navigate('/applications/new');
        break;
      case 'LOAN_OFFICER':
        navigate('/applications');
        break;
      case 'FIELD_OFFICER':
        navigate('/field-visits');
        break;
      case 'CREDIT_MANAGER':
        navigate('/underwriting');
        break;
      case 'SENIOR_MANAGER':
        navigate('/approvals');
        break;
      case 'LEGAL_OFFICER':
        navigate('/legal-agreements');
        break;
      case 'FINANCE_OFFICER':
        navigate('/disbursements');
        break;
      case 'CREDIT_CONTROL_OFFICER':
        navigate('/collections');
        break;
      case 'ADMIN':
        navigate('/admin/users');
        break;
      default:
        navigate('/applications');
    }
  };

  // Columns for the Live Applications Queue
  const applicationColumns = [
    {
      title: 'Reference #',
      dataIndex: 'applicationNumber',
      key: 'applicationNumber',
      render: (text) => <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">{text}</span>,
    },
    {
      title: 'Borrower',
      dataIndex: 'applicantName',
      key: 'applicantName',
      render: (text, record) => (
        <div>
          <span className="font-medium text-slate-900 dark:text-slate-200 block text-xs">{text || 'Applicant'}</span>
          {record.applicantNic && <span className="text-[11px] text-slate-500">{record.applicantNic}</span>}
        </div>
      ),
    },
    {
      title: 'Facility Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <span className="text-slate-600 dark:text-slate-300 text-xs">
          {type === 'VEHICLE_LEASING' ? 'Vehicle Lease' : 'Money Loan'}
        </span>
      ),
    },
    {
      title: 'Requested Amount',
      dataIndex: 'requestedAmount',
      key: 'requestedAmount',
      render: (amt) => <span className="font-semibold text-slate-900 dark:text-white text-xs">{formatLkr(amt)}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        let actionLabel = 'View';
        let targetUrl = `/applications/${record.id}`;

        if (effectiveRole === 'LOAN_OFFICER') {
          actionLabel = 'Review';
          targetUrl = `/applications/${record.id}/verify`;
        } else if (effectiveRole === 'FIELD_OFFICER') {
          actionLabel = 'Inspect';
          targetUrl = `/applications/${record.id}/inspect`;
        } else if (effectiveRole === 'CREDIT_MANAGER') {
          actionLabel = 'Assess';
          targetUrl = `/applications/${record.id}/assess`;
        } else if (effectiveRole === 'SENIOR_MANAGER') {
          actionLabel = 'Authorize';
          targetUrl = `/applications/${record.id}/authorize`;
        } else if (effectiveRole === 'LEGAL_OFFICER') {
          actionLabel = 'Agreement';
          targetUrl = `/applications/${record.id}/agreement`;
        } else if (effectiveRole === 'FINANCE_OFFICER') {
          actionLabel = 'Disburse';
          targetUrl = `/disbursements`;
        }

        return (
          <Button
            type="link"
            size="small"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 p-0 flex items-center gap-1 text-xs font-medium"
            onClick={() => navigate(targetUrl)}
          >
            {actionLabel} <ArrowRight className="w-3 h-3" />
          </Button>
        );
      },
    },
  ];

  // Columns for Delinquent / Installments Table
  const installmentColumns = [
    {
      title: 'Inst #',
      dataIndex: 'installmentNumber',
      key: 'installmentNumber',
      render: (num) => <span className="font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">#{num}</span>,
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => (
        <span className="text-slate-600 dark:text-slate-300 text-xs font-mono">
          {date ? dayjs(date).format('YYYY-MM-DD') : '-'}
        </span>
      ),
    },
    {
      title: 'Total Due',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amt) => <span className="font-semibold text-slate-900 dark:text-white text-xs">{formatLkr(amt)}</span>,
    },
    {
      title: 'Paid',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (amt) => <span className="text-emerald-600 dark:text-emerald-400 text-xs">{formatLkr(amt)}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Button
          type="link"
          size="small"
          className="text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 p-0 flex items-center gap-1 text-xs font-medium"
          onClick={() => navigate(effectiveRole === 'APPLICANT' ? '/my-repayments' : '/collections')}
        >
          {effectiveRole === 'APPLICANT' ? 'Repay' : 'Follow Up'} <ArrowRight className="w-3 h-3" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & Command Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 dark:from-slate-900 dark:via-blue-950/60 dark:to-slate-900 border border-blue-500/30 dark:border-slate-800 p-6 sm:p-8 shadow-lg text-white">
        {/* Top-Right Corner Icon-Only Refresh Button */}
        <Button
          icon={<RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />}
          onClick={() => refetch()}
          title="Refresh Dashboard"
          aria-label="Refresh Dashboard"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 bg-white/15 hover:bg-white/25 text-white border-white/20 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700/80 h-9 w-9 p-0 flex items-center justify-center rounded-lg shadow-sm"
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pr-12 md:pr-14">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400 text-xs font-semibold">
                <span>ACTIVE DESK: {effectiveRole.replace(/_/g, ' ')}</span>
              </div>

              {/* Admin Multi-Role Switcher */}
              {user?.role === 'ADMIN' && (
                <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-950/80 px-2.5 py-1 rounded-full border border-white/20 dark:border-purple-500/40">
                  <span className="text-[11px] text-purple-100 dark:text-purple-300 font-semibold">Admin View As:</span>
                  <Select
                    size="small"
                    value={selectedRole}
                    onChange={(val) => setSelectedRole(val)}
                    className="w-40 custom-role-select"
                    bordered={false}
                    options={ALL_ROLES.map((r) => ({
                      value: r,
                      label: r.replace(/_/g, ' '),
                    }))}
                  />
                </div>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white m-0">
              Welcome back, {user?.fullName || 'User'}
            </h2>
            <p className="text-sm text-blue-100 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Smart Line Investment Management System. Operational metrics, credit portfolio, and workflow queues are synchronized in real time.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {effectiveRole === 'APPLICANT' ? (
              <div className="flex items-center gap-2">
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate('/applications/new')}
                  className="bg-white hover:bg-blue-50 text-blue-700 font-semibold border-0 shadow-lg flex items-center gap-2 h-11"
                >
                  <Plus className="w-4 h-4 text-blue-700" /> Apply for Loan
                </Button>
                <Button
                  size="large"
                  onClick={() => navigate('/my-repayments')}
                  className="bg-white/15 hover:bg-white/25 text-white border-white/20 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 flex items-center gap-2 h-11"
                >
                  <Banknote className="w-4 h-4 text-emerald-300" /> My Repayments
                </Button>
              </div>
            ) : (
              <Button
                type="primary"
                size="large"
                onClick={handlePrimaryAction}
                className="bg-white hover:bg-blue-50 text-blue-700 font-semibold border-0 shadow-lg flex items-center gap-2 h-11"
              >
                <FileText className="w-4 h-4 text-blue-700" />
                {effectiveRole === 'ADMIN' ? 'Manage Users' : 'Open Desk Queue'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <Alert
          type="error"
          message="Failed to load dashboard metrics"
          description={error.message || 'Error communicating with backend.'}
          showIcon
          className="bg-red-950/40 border-red-900 text-red-200"
        />
      )}

      {/* KPI Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="rounded-xl bg-slate-900/80 border border-slate-800 p-5">
              <Skeleton active paragraph={{ rows: 2 }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpiCards.map((metric, idx) => {
            const IconComponent = ICON_MAP[metric.icon] || FileText;
            return (
              <StatCard
                key={idx}
                title={metric.title}
                value={metric.value}
                icon={IconComponent}
                color={metric.color || 'blue'}
                trend={metric.trend}
                subtitle={metric.subtitle}
              />
            );
          })}
        </div>
      )}

      {/* Visual Charts Row (Staff Only) */}
      {effectiveRole !== 'APPLICANT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DistributionChart
              title="Application Pipeline by Lifecycle Stage"
              subtitle="Real-time case distribution across all workflow statuses"
              data={statusDistribution}
              type="bar"
            />
          </div>
          <div>
            <DistributionChart
              title={effectiveRole === 'ADMIN' ? 'System Roles Breakdown' : 'Portfolio by Facility Type'}
              subtitle={effectiveRole === 'ADMIN' ? 'Active registered users by assigned role' : 'Money Loan vs Vehicle Leasing balance'}
              data={effectiveRole === 'ADMIN' ? roleDistribution : typeDistribution}
              type="donut"
            />
          </div>
        </div>
      )}

      {/* Operational Queue & Activity Feed */}
      <div className={`grid grid-cols-1 ${hasRightColumn ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6`}>
        {/* Main Table Column */}
        <div className={`${hasRightColumn ? 'lg:col-span-2' : 'lg:col-span-1'} space-y-6`}>
          {effectiveRole === 'CREDIT_CONTROL_OFFICER' ? (
            /* Delinquent Installments Table */
            <div className="rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white m-0 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400" /> High-Priority Delinquent Installments
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Overdue loan/lease installments requiring collection follow-ups</p>
                </div>
                <Button
                  type="link"
                  size="small"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  onClick={() => navigate('/collections')}
                >
                  View All Delinquencies
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table
                  columns={installmentColumns}
                  dataSource={recentInstallments.map((item) => ({ ...item, key: item.id }))}
                  pagination={false}
                  size="middle"
                  locale={{ emptyText: <div className="py-6 text-xs text-slate-400 dark:text-slate-500">No overdue installments currently on file</div> }}
                />
              </div>
            </div>
          ) : (
            /* Applications Queue Table */
            <div className="rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white m-0 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    {effectiveRole === 'APPLICANT' ? 'My Recent Applications' : 'Operational Workflow Queue'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {effectiveRole === 'APPLICANT'
                      ? 'Live tracking of your submitted loan & lease requests'
                      : 'Applications currently requiring attention at this operational stage'}
                  </p>
                </div>
                <Button
                  type="link"
                  size="small"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  onClick={handlePrimaryAction}
                >
                  View All
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table
                  columns={applicationColumns}
                  dataSource={recentApplications.map((item) => ({ ...item, key: item.id }))}
                  pagination={false}
                  size="middle"
                  locale={{ emptyText: <div className="py-6 text-xs text-slate-400 dark:text-slate-500">No applications currently in this queue</div> }}
                />
              </div>
            </div>
          )}

          {/* If applicant, also show upcoming installments */}
          {effectiveRole === 'APPLICANT' && recentInstallments?.length > 0 && (
            <div className="rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white m-0 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Upcoming Installments Schedule
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Scheduled repayments for your active facilities</p>
                </div>
                <Button
                  type="link"
                  size="small"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  onClick={() => navigate('/my-repayments')}
                >
                  View All Repayments
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table
                  columns={installmentColumns}
                  dataSource={recentInstallments.map((item) => ({ ...item, key: item.id }))}
                  pagination={false}
                  size="middle"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Recent Activity Feed (Admin Only) & Customer Support (Applicant) */}
        {hasRightColumn && (
          <div className="space-y-6">
            {/* Audit / Transition Activity Feed (Admin Only with Pagination) */}
            {effectiveRole === 'ADMIN' && (
              <RecentActivityFeed logs={recentAuditLogs} pageSize={2} />
            )}

            {/* Contextual Info Box: Customer Support for Applicant */}
            {effectiveRole === 'APPLICANT' && (
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-slate-900 dark:to-blue-950/40 border border-blue-100 dark:border-slate-800 p-5 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Borrower Support & Help Desk
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  Have questions regarding your loan application, vehicle lease, or upcoming repayment schedule? Our customer service team is ready to assist.
                </p>
                <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950/80 p-3 rounded-lg border border-blue-100 dark:border-slate-800 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Customer Hotline:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">+94 11 234 5678</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Documentation Email:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">support@smartline.lk</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Working Hours:</span>
                    <span className="text-slate-700 dark:text-slate-300">Mon - Fri (8:30 AM - 5:00 PM)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleDashboardHub;
