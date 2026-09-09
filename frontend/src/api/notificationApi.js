import axiosClient from './axiosClient';

export const notificationApi = {
  getNotifications: async (params = {}) => {
    const res = await axiosClient.get('/notifications', { params });
    return res.data;
  },

  getUnreadCount: async () => {
    const res = await axiosClient.get('/notifications/unread-count');
    return res.data;
  },

  markAsRead: async (id) => {
    const res = await axiosClient.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await axiosClient.patch('/notifications/mark-all-read');
    return res.data;
  },
};

export default notificationApi;
