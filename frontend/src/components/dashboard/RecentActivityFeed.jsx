import React, { useState } from 'react';
import { Tag, Pagination } from 'antd';
import { Clock, User, ArrowRight, Activity } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const RecentActivityFeed = ({
  logs = [],
  title = 'Recent System Activity',
  subtitle = 'Latest lifecycle & audit transitions',
  pageSize = 2,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (!logs || logs.length === 0) {
    return (
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg">
        <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" /> {title}
        </h4>
        {subtitle && <p className="text-xs text-slate-400 mb-4">{subtitle}</p>}
        <div className="py-8 text-center text-xs text-slate-500">
          No recent activity logged yet
        </div>
      </div>
    );
  }

  const total = logs.length;
  const startIndex = (currentPage - 1) * pageSize;
  const currentLogs = logs.slice(startIndex, startIndex + pageSize);

  return (
    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-white m-0 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" /> {title}
            </h4>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Live Audit Log
          </span>
        </div>

        <div className="space-y-2.5">
          {currentLogs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {log.fromStatus && (
                    <>
                      <StatusBadge status={log.fromStatus} />
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                    </>
                  )}
                  <StatusBadge status={log.toStatus} />
                </div>
                <span className="text-[11px] text-slate-500 flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3" />
                  {log.changedAt ? dayjs(log.changedAt).fromNow() : 'recently'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs mt-1.5 text-slate-400">
                <span className="flex items-center gap-1 text-slate-300">
                  <User className="w-3 h-3 text-slate-500" />
                  <span className="font-medium text-xs">{log.changedByName || 'System'}</span>
                  {log.changedByRole && (
                    <Tag className="text-[10px] ml-1 bg-slate-800 text-slate-300 border-0 leading-tight py-0">
                      {log.changedByRole.replace(/_/g, ' ')}
                    </Tag>
                  )}
                </span>
                {log.remarks && (
                  <span className="text-slate-400 italic text-[11px] truncate max-w-[170px]" title={log.remarks}>
                    "{log.remarks}"
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {total > pageSize && (
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400">
            {startIndex + 1}–{Math.min(startIndex + pageSize, total)} of {total}
          </span>
          <Pagination
            size="small"
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
};

export default RecentActivityFeed;
