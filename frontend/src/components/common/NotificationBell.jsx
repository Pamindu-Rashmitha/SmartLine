import React, { useState } from 'react';
import { Popover, Badge, Button, Tabs, Empty } from 'antd';
import {
  Bell,
  CheckCheck,
  Radio,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNotifications } from '../../contexts/NotificationContext';

dayjs.extend(relativeTime);

const TYPE_CONFIG = {
  ACTION_REQUIRED: {
    icon: AlertCircle,
    color: 'text-amber-500 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
    tagText: 'Action',
  },
  WARNING: {
    icon: AlertTriangle,
    color: 'text-rose-500 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
    tagText: 'Alert',
  },
  STATUS_UPDATE: {
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
    tagText: 'Update',
  },
  INFO: {
    icon: Info,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
    tagText: 'Info',
  },
};

const NotificationBell = () => {
  const { notifications, unreadCount, isConnected, loading, markAsRead, markAllAsRead, refreshNotifications } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  const handleItemClick = (notif) => {
    if (!notif.read) {
      markAsRead(notif.id);
    }
    setOpen(false);
    if (notif.targetUrl) {
      navigate(notif.targetUrl);
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === 'unread') return !notif.read;
    if (activeTab === 'action') return notif.type === 'ACTION_REQUIRED';
    return true;
  });

  const popoverContent = (
    <div className="w-[380px] max-w-[90vw] -mx-4 -my-3 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xl text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Notifications</span>
          <div
            className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${isConnected
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
              }`}
            title={isConnected ? 'Live WebSocket Connected' : 'Reconnecting...'}
          >
            <Radio className={`w-3 h-3 ${isConnected ? 'animate-pulse' : ''}`} />
            <span>{isConnected ? 'Live' : 'Polling'}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={refreshNotifications}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-0 bg-transparent cursor-pointer"
            title="Refresh notifications"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors border-0 bg-transparent cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="small"
          className="custom-notification-tabs mb-[-1px]"
          items={[
            { key: 'all', label: `All (${notifications.length})` },
            { key: 'unread', label: `Unread (${unreadCount})` },
            {
              key: 'action',
              label: `Actions (${notifications.filter((n) => n.type === 'ACTION_REQUIRED').length})`,
            },
          ]}
        />
      </div>

      {/* Notification List */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 custom-scrollbar">
        {filteredNotifications.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-xs text-slate-400">
                  {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </span>
              }
            />
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.INFO;
            const Icon = config.icon;

            return (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`flex gap-3 px-4 py-3 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60 ${!notif.read ? 'bg-blue-50/60 dark:bg-blue-950/20 border-l-2 border-blue-600 dark:border-blue-500' : 'opacity-85 hover:opacity-100'
                  }`}
              >
                <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 border ${config.bgColor}`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-xs truncate ${!notif.read ? 'font-semibold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300'
                        }`}
                    >
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 whitespace-nowrap">
                      {dayjs(notif.createdAt).fromNow()}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug line-clamp-2">
                    {notif.message}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    {notif.referenceType && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-mono text-[9px]">
                        {notif.referenceType}
                      </span>
                    )}
                    {notif.targetUrl && (
                      <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400 font-medium ml-auto hover:underline">
                        <span>View</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-950/60 text-[11px] text-slate-500 dark:text-slate-400">
          Showing recent activity
        </div>
      )}
    </div>
  );

  return (
    <Popover
      content={popoverContent}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      overlayClassName="notification-popover"
    >
      <button
        type="button"
        className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors border-0 bg-transparent cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center leading-none shadow">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </>
        )}
      </button>
    </Popover>
  );
};

export default NotificationBell;
