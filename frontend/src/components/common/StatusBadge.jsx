import React from 'react';

const STATUS_CONFIG = {
  SUBMITTED: { label: 'Submitted', bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/30', dot: 'bg-blue-500 dark:bg-blue-400' },
  PENDING: { label: 'Pending', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/30', dot: 'bg-amber-500 dark:bg-amber-400' },
  UNDER_REVIEW: { label: 'Under Review', bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-500/30', dot: 'bg-purple-500 dark:bg-purple-400' },
  VERIFIED: { label: 'Field Verified', bg: 'bg-teal-50 dark:bg-teal-500/10', text: 'text-teal-700 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-500/30', dot: 'bg-teal-500 dark:bg-teal-400' },
  APPROVED: { label: 'Approved', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/30', dot: 'bg-emerald-500 dark:bg-emerald-400' },
  SANCTIONED: { label: 'Sanctioned', bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-500/30', dot: 'bg-indigo-500 dark:bg-indigo-400' },
  DISBURSED: { label: 'Disbursed', bg: 'bg-emerald-50 dark:bg-green-500/15', text: 'text-emerald-700 dark:text-green-300', border: 'border-emerald-200 dark:border-green-500/40', dot: 'bg-emerald-500 dark:bg-green-400' },
  REJECTED: { label: 'Rejected', bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-500/30', dot: 'bg-rose-500 dark:bg-rose-400' },
  ACTIVE: { label: 'Active Loan', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/30', dot: 'bg-emerald-500 dark:bg-emerald-400' },
  OVERDUE: { label: 'Overdue / Default', bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-500/30', dot: 'bg-red-500' },
  PAID: { label: 'Paid', bg: 'bg-emerald-50 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/40', dot: 'bg-emerald-500 dark:bg-emerald-400' },
  PARTIALLY_PAID: { label: 'Partially Paid', bg: 'bg-cyan-50 dark:bg-cyan-500/10', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-500/30', dot: 'bg-cyan-500 dark:bg-cyan-400' },
  COMPLETED: { label: 'Completed', bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-500/30', dot: 'bg-indigo-500 dark:bg-indigo-400' },
  SETTLED: { label: 'Settled', bg: 'bg-slate-100 dark:bg-slate-500/10', text: 'text-slate-700 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-500/30', dot: 'bg-slate-500 dark:bg-slate-400' },
};

const StatusBadge = ({ status, className = '' }) => {
  const normalized = status ? status.toUpperCase() : 'PENDING';
  const config = STATUS_CONFIG[normalized] || {
    label: status || 'Unknown',
    bg: 'bg-slate-100 dark:bg-slate-500/10',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-500/30',
    dot: 'bg-slate-500 dark:bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
