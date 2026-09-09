import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { notification as antNotification } from 'antd';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { useAuth } from './AuthContext';
import { notificationApi } from '../api/notificationApi';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const stompClientRef = useRef(null);

  // Fetch initial notifications and count
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const [listRes, countRes] = await Promise.all([
        notificationApi.getNotifications({ page: 0, size: 20 }),
        notificationApi.getUnreadCount(),
      ]);

      if (listRes?.data?.content) {
        setNotifications(listRes.data.content);
      }
      if (countRes?.data !== undefined) {
        setUnreadCount(Number(countRes.data) || 0);
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleIncomingNotification = useCallback(
    (notif) => {
      setNotifications((prev) => [notif, ...prev.filter((item) => item.id !== notif.id)]);
      setUnreadCount((prev) => prev + 1);

      // Ant Design toast notification pop-up
      const getIcon = () => {
        switch (notif.type) {
          case 'ACTION_REQUIRED':
            return <AlertCircle className="w-5 h-5 text-amber-400" />;
          case 'WARNING':
            return <AlertTriangle className="w-5 h-5 text-rose-400" />;
          case 'STATUS_UPDATE':
            return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
          default:
            return <Info className="w-5 h-5 text-blue-400" />;
        }
      };

      antNotification.open({
        message: (
          <span className="font-semibold text-slate-100 text-sm">{notif.title}</span>
        ),
        description: (
          <span className="text-slate-300 text-xs leading-relaxed">{notif.message}</span>
        ),
        icon: getIcon(),
        placement: 'bottomRight',
        duration: 5,
        style: {
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
          cursor: notif.targetUrl ? 'pointer' : 'default',
        },
        onClick: () => {
          if (notif.targetUrl) {
            navigate(notif.targetUrl);
          }
        },
      });
    },
    [navigate]
  );

  // Setup WebSocket / STOMP Connection
  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    fetchNotifications();

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true);

        // 1. Personal user destination: /user/queue/notifications
        client.subscribe('/user/queue/notifications', (msg) => {
          try {
            const data = JSON.parse(msg.body);
            handleIncomingNotification(data);
          } catch (e) {
            console.error('Failed to parse STOMP message:', e);
          }
        });

        // 2. Departmental role broadcast: /topic/role-{ROLE}
        if (user?.role) {
          client.subscribe(`/topic/role-${user.role}`, (msg) => {
            try {
              const data = JSON.parse(msg.body);
              handleIncomingNotification(data);
            } catch (e) {
              console.error('Failed to parse role STOMP message:', e);
            }
          });
        }
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.warn('STOMP error:', frame?.headers?.['message']);
        setIsConnected(false);
      },
      onWebSocketClose: () => {
        setIsConnected(false);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (client) {
        client.deactivate();
      }
      setIsConnected(false);
    };
  }, [isAuthenticated, token, user?.role, fetchNotifications, handleIncomingNotification]);

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Failed to mark all as read:', err);
    }
  };

  const value = {
    notifications,
    unreadCount,
    isConnected,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
