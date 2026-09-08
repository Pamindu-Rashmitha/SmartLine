import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Tag, Progress } from 'antd';
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
  Send,
  Plus,
  Compass,
  DollarSign,
  Scale,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import dayjs from 'dayjs';

const ROLE_METRICS = {
  APPLICANT: [
    { title: 'Credit Score', value: '745 / 850', icon: TrendingUp, color: 'emerald', trend: '+15 pts', subtitle: 'Excellent Rating' },
    { title: 'Active Loans', value: '1 Active', icon: CreditCard, color: 'blue', subtitle: 'LKR 450,000 Remaining' },
    { title: 'Next EMI Due', value: 'LKR 28,450', icon: Clock, color: 'amber', subtitle: 'Due in 14 days' },
    { title: 'Eligibility Limit', value: 'LKR 2,500,000', icon: CheckCircle2, color: 'purple', subtitle: 'Pre-Approved' },
  ],
  LOAN_OFFICER: [
    { title: 'Applications in Pipeline', value: '18 Active', icon: FileText, color: 'blue', trend: '+4 today', subtitle: 'Awaiting Appraisal' },
    { title: 'KYC Checks Completed', value: '94.2%', icon: CheckCircle2, color: 'emerald', trend: '+2.1%', subtitle: 'High compliance' },
    { title: 'Avg Appraisal Time', value: '1.8 Days', icon: Clock, color: 'purple', subtitle: 'Target: < 2.0 days' },
    { title: 'Pending Customer Calls', value: '6 Pending', icon: AlertCircle, color: 'amber', subtitle: 'Docs incomplete' },
  ],
  FIELD_OFFICER: [
    { title: 'Assigned Site Visits', value: '5 Scheduled', icon: Compass, color: 'blue', subtitle: 'Colombo & Gampaha' },
    { title: 'Completed This Week', value: '12 Visits', icon: CheckCircle2, color: 'emerald', trend: '+3 vs last week', subtitle: '100% verified' },
    { title: 'Pending Geo-Reports', value: '2 Pending', icon: Clock, color: 'amber', subtitle: 'Upload photos required' },
    { title: 'Collateral Valuations', value: 'LKR 18.4M', icon: DollarSign, color: 'purple', subtitle: 'Verified asset value' },
  ],
  CREDIT_MANAGER: [
    { title: 'Underwriting Queue', value: '11 Cases', icon: FileText, color: 'purple', subtitle: 'Ready for risk scoring' },
    { title: 'High-Risk Flags', value: '3 Flagged', icon: ShieldAlert, color: 'amber', subtitle: 'DTI > 55% or CRIB alert' },
    { title: 'Approval Rate (MTD)', value: '78.4%', icon: CheckCircle2, color: 'emerald', trend: '+4.2%', subtitle: 'Optimal quality' },
    { title: 'Evaluated Portfolio', value: 'LKR 42.8M', icon: DollarSign, color: 'blue', subtitle: 'This month' },
  ],
  SENIOR_MANAGER: [
    { title: 'High-Value Sanctions', value: '4 Pending', icon: Scale, color: 'indigo', subtitle: '> LKR 2.5M Threshold' },
    { title: 'Total Portfolio Size', value: 'LKR 248.5M', icon: DollarSign, color: 'emerald', trend: '+8.6% MoM', subtitle: 'Performing: 96.8%' },
    { title: 'NPL Ratio', value: '2.14%', icon: AlertCircle, color: 'amber', trend: '-0.3%', subtitle: 'Industry benchmark 3.5%' },
    { title: 'Executive Approvals', value: '28 Signed', icon: CheckCircle2, color: 'blue', subtitle: 'This quarter' },
  ],
  LEGAL_OFFICER: [
    { title: 'Agreements to Draft', value: '6 Loans', icon: Scale, color: 'amber', subtitle: 'Sanctioned today' },
    { title: 'Title Deeds Verified', value: '19 Completed', icon: CheckCircle2, color: 'emerald', subtitle: 'Zero encumbrances' },
    { title: 'Promissory Notes', value: '8 Ready', icon: FileText, color: 'blue', subtitle: 'Awaiting signature' },
    { title: 'Legal Dispatches', value: '4 Pending', icon: Clock, color: 'purple', subtitle: 'Courier scheduled' },
  ],
  FINANCE_OFFICER: [
    { title: 'Pending Disbursements', value: 'LKR 14.2M', icon: DollarSign, color: 'emerald', subtitle: '5 approved vouchers' },
    { title: 'Batch SLIPS Processed', value: '18 Transferred', icon: CheckCircle2, color: 'blue', subtitle: 'Settled today' },
    { title: 'Repayment Reconciliation', value: '99.1%', icon: TrendingUp, color: 'purple', subtitle: 'Auto-matched via Bank feed' },
    { title: 'Suspense Accounts', value: 'LKR 84,000', icon: AlertCircle, color: 'amber', subtitle: '2 unidentified payments' },
  ],
  CREDIT_CONTROL_OFFICER: [
    { title: '30-Day Overdue Bucket', value: '14 Accounts', icon: AlertCircle, color: 'amber', subtitle: 'LKR 1.2M Total EMI' },
    { title: '60+ Day Delinquency', value: '4 Accounts', icon: ShieldAlert, color: 'purple', subtitle: 'Demand letter issued' },
    { title: 'Recoveries Recovered', value: 'LKR 840,000', icon: CheckCircle2, color: 'emerald', trend: '+12%', subtitle: 'Recovered this month' },
    { title: 'Follow-up Call Tasks', value: '22 Scheduled', icon: Clock, color: 'blue', subtitle: 'For today' },
  ],
  ADMIN: [
    { title: 'Total Registered Users', value: '84 Users', icon: Users, color: 'blue', trend: '+9 staff demo accounts', subtitle: 'Active system users' },
    { title: 'System Health', value: '100% Online', icon: CheckCircle2, color: 'emerald', subtitle: 'API, MySQL, Security OK' },
    { title: 'Security Audit Logs', value: '1,420 Events', icon: ShieldAlert, color: 'purple', subtitle: 'Zero security breaches' },
    { title: 'Active User Roles', value: '9 Roles Configured', icon: Scale, color: 'amber', subtitle: 'RBAC Enforcement Active' },
  ],
};

const SAMPLE_APPLICATIONS = [
  { id: 'APP-2026-081', customer: 'Saman Kumara', amount: 'LKR 1,200,000', type: 'Personal Loan', term: '36 Months', status: 'UNDER_REVIEW', date: '2026-09-07' },
  { id: 'APP-2026-079', customer: 'Nimali Jayawardena', amount: 'LKR 3,500,000', type: 'Auto Lease', term: '48 Months', status: 'SANCTIONED', date: '2026-09-06' },
  { id: 'APP-2026-075', customer: 'Ruwan Weerasinghe', amount: 'LKR 800,000', type: 'SME Micro Loan', term: '24 Months', status: 'APPROVED', date: '2026-09-05' },
  { id: 'APP-2026-072', customer: 'Sunil Perera', amount: 'LKR 5,000,000', type: 'Commercial Vehicle', term: '60 Months', status: 'DISBURSED', date: '2026-09-03' },
  { id: 'APP-2026-068', customer: 'Anoma Fernando', amount: 'LKR 400,000', type: 'Emergency Personal', term: '12 Months', status: 'VERIFIED', date: '2026-09-02' },
];

const RoleDashboardHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'APPLICANT';
  const metrics = ROLE_METRICS[role] || ROLE_METRICS.APPLICANT;

  const columns = [
    {
      title: 'Reference #',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <span className="font-mono text-xs font-semibold text-blue-400">{text}</span>,
    },
    {
      title: 'Borrower Name',
      dataIndex: 'customer',
      key: 'customer',
      render: (text) => <span className="font-medium text-slate-200">{text}</span>,
    },
    {
      title: 'Facility Type',
      dataIndex: 'type',
      key: 'type',
      render: (text) => <span className="text-slate-300 text-xs">{text}</span>,
    },
    {
      title: 'Requested Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (text) => <span className="font-semibold text-white">{text}</span>,
    },
    {
      title: 'Tenor',
      dataIndex: 'term',
      key: 'term',
      render: (text) => <span className="text-slate-400 text-xs">{text}</span>,
    },
    {
      title: 'Current Stage',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => <span className="text-slate-400 text-xs">{date}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/60 via-slate-900/90 to-slate-900 border border-blue-500/20 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-3">
              <span>ACTIVE ROLE: {role.replace(/_/g, ' ')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white m-0">
              Welcome, {user?.fullName || 'User'}
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Smart Line Investment Management Console. All security policies, role entitlements, and audit logs are active.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {role === 'APPLICANT' ? (
              <Button
                type="primary"
                size="large"
                onClick={() => navigate('/applications/new')}
                className="bg-blue-600 hover:bg-blue-500 font-semibold border-0 shadow-lg shadow-blue-600/30 flex items-center gap-2 h-11"
              >
                <Plus className="w-4 h-4" /> Apply for New Loan
              </Button>
            ) : (
              <Button
                type="primary"
                size="large"
                onClick={() => {
                  if (role === 'CREDIT_MANAGER') navigate('/underwriting');
                  else if (role === 'FIELD_OFFICER') navigate('/field-visits');
                  else if (role === 'SENIOR_MANAGER') navigate('/approvals');
                  else if (role === 'LEGAL_OFFICER') navigate('/legal-agreements');
                  else if (role === 'FINANCE_OFFICER') navigate('/disbursements');
                  else navigate('/applications');
                }}
                className="bg-blue-600 hover:bg-blue-500 font-semibold border-0 shadow-lg shadow-blue-600/30 flex items-center gap-2 h-11"
              >
                <FileText className="w-4 h-4" /> View Queue
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((metric, idx) => (
          <StatCard
            key={idx}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            color={metric.color}
            trend={metric.trend}
            subtitle={metric.subtitle}
          />
        ))}
      </div>

      {/* Main Content: Pipeline & Workflow Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loan Pipeline Table */}
        <div className="lg:col-span-2 rounded-xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white m-0">Active Facility Workflow Pipeline</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time status tracking across credit appraisal stages</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300">
              5 In-Progress
            </span>
          </div>

          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={SAMPLE_APPLICATIONS.map((item) => ({ ...item, key: item.id }))}
              pagination={false}
              size="middle"
            />
          </div>
        </div>

        {/* Quick Operations & System Status */}
        <div className="space-y-6">
          {/* Workflow Stage Tracker */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg">
            <h3 className="text-base font-bold text-white mb-1">Underwriting Lifecycle</h3>
            <p className="text-xs text-slate-400 mb-4">Standard 8-Stage Smart Line Approval Chain</p>

            <div className="space-y-3">
              {[
                { stage: '1. Online Application', status: 'Active', color: 'bg-emerald-500' },
                { stage: '2. Field Inspection (Geo-tag)', status: 'Active', color: 'bg-emerald-500' },
                { stage: '3. Credit Evaluation & CRIB', status: 'Active', color: 'bg-emerald-500' },
                { stage: '4. Legal Deed Drafting', status: 'Active', color: 'bg-emerald-500' },
                { stage: '5. Executive Sanction', status: 'Active', color: 'bg-emerald-500' },
                { stage: '6. Disbursement (SLIPS)', status: 'Active', color: 'bg-emerald-500' },
              ].map((step, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-xs font-medium text-slate-300">{step.stage}</span>
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                    <span className={`w-1.5 h-1.5 rounded-full ${step.color}`} />
                    {step.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="rounded-xl bg-gradient-to-br from-slate-900 to-blue-950/40 border border-slate-800 p-5">
            <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400" /> Phase 1 Foundation Verified
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Spring Boot 3 REST API + MySQL 8.0 connection verified. Stateless JWT authentication & 9-role authorization active.
            </p>
            <div className="text-[11px] text-slate-400 bg-slate-950/80 p-2.5 rounded border border-slate-800 font-mono">
              Database: loan_management_db<br />
              Auth Mode: Bearer JWT (24hr expiry)<br />
              Server: http://localhost:8080
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDashboardHub;
