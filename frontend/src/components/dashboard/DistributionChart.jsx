import React from 'react';

const PALETTE = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#8b5cf6', // purple-500
  '#f59e0b', // amber-500
  '#06b6d4', // cyan-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
  '#ef4444', // red-500
];

const STATUS_COLOR_MAP = {
  DRAFT: '#64748b',
  SUBMITTED: '#3b82f6',
  UNDER_VERIFICATION: '#0284c7',
  VERIFIED: '#10b981',
  PENDING_FIELD_INSPECTION: '#f59e0b',
  FIELD_INSPECTION_COMPLETED: '#0d9488',
  UNDER_CREDIT_ASSESSMENT: '#8b5cf6',
  PENDING_SENIOR_APPROVAL: '#6366f1',
  APPROVED: '#059669',
  REJECTED: '#ef4444',
  AGREEMENT_PENDING: '#d97706',
  AGREEMENT_VERIFIED: '#0284c7',
  PENDING_DOWN_PAYMENT: '#f59e0b',
  PENDING_DISBURSAL: '#8b5cf6',
  DISBURSED: '#10b981',
  CANCELLED: '#475569',
  LOAN: '#3b82f6',
  VEHICLE_LEASING: '#8b5cf6',
};

const DistributionChart = ({ title, subtitle, data = {}, type = 'bar' }) => {
  const entries = Object.entries(data).filter(([_, val]) => Number(val) > 0);
  const total = entries.reduce((acc, [_, val]) => acc + Number(val), 0);

  if (entries.length === 0 || total === 0) {
    return (
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg">
        <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
        {subtitle && <p className="text-xs text-slate-400 mb-4">{subtitle}</p>}
        <div className="py-8 text-center text-xs text-slate-500">
          No distribution data available
        </div>
      </div>
    );
  }

  const items = entries.map(([key, val], idx) => {
    const count = Number(val);
    const percent = Math.round((count / total) * 100);
    const color = STATUS_COLOR_MAP[key] || PALETTE[idx % PALETTE.length];
    const formattedLabel = key.replace(/_/g, ' ');
    return { key, label: formattedLabel, count, percent, color };
  });

  if (type === 'donut') {
    // Render SVG Donut Chart
    let accumulatedAngle = 0;
    const size = 160;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-bold text-white m-0">{title}</h4>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {total} Total
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-2">
          {/* SVG Donut */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="#1e293b"
                strokeWidth={strokeWidth}
              />
              {items.map((item, i) => {
                const strokeDasharray = `${(item.percent / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((accumulatedAngle / 100) * circumference);
                accumulatedAngle += item.percent;
                return (
                  <circle
                    key={i}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 hover:opacity-80"
                  />
                );
              })}
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold text-white">{total}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 w-full sm:w-auto min-w-[140px]">
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300 capitalize">{item.label.toLowerCase()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-white">{item.count}</span>
                  <span className="text-slate-500 text-[11px]">({item.percent}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Horizontal Segmented Bar View
  return (
    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-bold text-white m-0">{title}</h4>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
          {total} Total
        </span>
      </div>

      {/* Multi-segment Bar */}
      <div className="w-full h-3 rounded-full overflow-hidden bg-slate-800 flex gap-0.5 my-3">
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              width: `${Math.max(item.percent, 3)}%`,
              backgroundColor: item.color,
            }}
            title={`${item.label}: ${item.count} (${item.percent}%)`}
            className="h-full transition-all duration-500 hover:brightness-125"
          />
        ))}
      </div>

      {/* Grid of Tags */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs"
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-300 truncate">{item.label}</span>
            </div>
            <span className="font-mono font-semibold text-white ml-2">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistributionChart;
