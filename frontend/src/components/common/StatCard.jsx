import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const COLOR_VARIANTS = {
  blue: {
    iconBg: 'bg-blue-600/15',
    iconColor: 'text-blue-400',
    borderHover: 'hover:border-blue-500/40',
    glow: 'group-hover:shadow-[0_0_25px_rgba(37,99,235,0.15)]',
  },
  emerald: {
    iconBg: 'bg-emerald-600/15',
    iconColor: 'text-emerald-400',
    borderHover: 'hover:border-emerald-500/40',
    glow: 'group-hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]',
  },
  purple: {
    iconBg: 'bg-purple-600/15',
    iconColor: 'text-purple-400',
    borderHover: 'hover:border-purple-500/40',
    glow: 'group-hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]',
  },
  amber: {
    iconBg: 'bg-amber-600/15',
    iconColor: 'text-amber-400',
    borderHover: 'hover:border-amber-500/40',
    glow: 'group-hover:shadow-[0_0_25px_rgba(245,158,11,0.15)]',
  },
  indigo: {
    iconBg: 'bg-indigo-600/15',
    iconColor: 'text-indigo-400',
    borderHover: 'hover:border-indigo-500/40',
    glow: 'group-hover:shadow-[0_0_25px_rgba(99,102,241,0.15)]',
  },
  rose: {
    iconBg: 'bg-rose-600/15',
    iconColor: 'text-rose-400',
    borderHover: 'hover:border-rose-500/40',
    glow: 'group-hover:shadow-[0_0_25px_rgba(244,63,94,0.15)]',
  },
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendType = 'up',
  subtitle,
  color = 'blue',
  className = '',
}) => {
  const scheme = COLOR_VARIANTS[color] || COLOR_VARIANTS.blue;

  let trendText = null;
  let effectiveTrendType = trendType;

  if (trend) {
    if (typeof trend === 'object') {
      trendText = trend.text || '';
      if (trend.positive !== undefined) {
        effectiveTrendType = trend.positive ? 'up' : 'down';
      }
    } else {
      trendText = String(trend);
      if (trendText.startsWith('+')) {
        effectiveTrendType = 'up';
      } else if (trendText.startsWith('-')) {
        effectiveTrendType = 'down';
      }
    }
  }

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    const IconComp = Icon;
    return <IconComp className="w-5 h-5" />;
  };

  return (
    <div
      className={`group relative rounded-xl bg-slate-900/80 border border-slate-800 p-5 transition-all duration-300 ${scheme.borderHover} ${scheme.glow} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
        </div>

        {Icon && (
          <div className={`p-3 rounded-lg ${scheme.iconBg} ${scheme.iconColor} transition-transform duration-300 group-hover:scale-110`}>
            {renderIcon()}
          </div>
        )}
      </div>

      {(trendText || subtitle) && (
        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-800/80 text-xs">
          {trendText && (
            <span
              className={`inline-flex items-center font-semibold ${
                effectiveTrendType === 'up'
                  ? 'text-emerald-400'
                  : effectiveTrendType === 'down'
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {effectiveTrendType === 'up' ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : effectiveTrendType === 'down' ? (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              ) : null}
              {trendText}
            </span>
          )}
          {subtitle && <span className="text-slate-400 truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
