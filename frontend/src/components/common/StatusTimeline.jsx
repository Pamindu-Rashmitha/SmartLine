import React from 'react';
import { Timeline, Tag } from 'antd';
import dayjs from 'dayjs';

const getStatusColor = (status) => {
  switch (status) {
    case 'APPROVED':
    case 'VERIFIED':
    case 'DISBURSED':
      return 'green';
    case 'REJECTED':
    case 'CANCELLED':
      return 'red';
    case 'PENDING_SENIOR_APPROVAL':
    case 'PENDING_FIELD_INSPECTION':
      return 'gold';
    default:
      return 'blue';
  }
};

const StatusTimeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return <div className="text-xs text-slate-500 py-4">No status transitions recorded yet.</div>;
  }

  const items = history.map((item) => ({
    color: getStatusColor(item.toStatus),
    children: (
      <div className="text-xs space-y-1 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Tag color={getStatusColor(item.toStatus)} className="font-mono text-[11px]">
            {item.toStatus}
          </Tag>
          <span className="text-slate-400 font-mono text-[11px]">
            {dayjs(item.changedAt).format('YYYY-MM-DD HH:mm:ss')}
          </span>
          {item.fromStatus && (
            <span className="text-slate-500 text-[10px]">
              (from <span className="font-mono">{item.fromStatus}</span>)
            </span>
          )}
        </div>
        {item.remarks && (
          <p className="text-slate-300 font-medium m-0 leading-relaxed bg-slate-950/40 p-2 rounded border border-slate-800/80">
            {item.remarks}
          </p>
        )}
        {item.changedByName && (
          <p className="text-slate-500 text-[11px] m-0">
            Recorded by: <span className="text-slate-400 font-semibold">{item.changedByName}</span>
            {item.changedByRole ? ` (${item.changedByRole})` : ''}
          </p>
        )}
      </div>
    ),
  }));

  return <Timeline items={items} className="pt-2" />;
};

export default StatusTimeline;
