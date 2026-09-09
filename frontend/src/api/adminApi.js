import axiosClient from './axiosClient';

export const adminApi = {
  // User Management
  getUsers: async (params = {}) => {
    const res = await axiosClient.get('/admin/users', { params });
    return res.data;
  },

  getUserStats: async () => {
    const res = await axiosClient.get('/admin/users/stats');
    return res.data;
  },

  getUserById: async (id) => {
    const res = await axiosClient.get(`/admin/users/${id}`);
    return res.data;
  },

  createUser: async (data) => {
    const res = await axiosClient.post('/admin/users', data);
    return res.data;
  },

  updateUser: async (id, data) => {
    const res = await axiosClient.put(`/admin/users/${id}`, data);
    return res.data;
  },

  toggleUserStatus: async (id, active) => {
    const res = await axiosClient.patch(`/admin/users/${id}/status`, null, {
      params: { active },
    });
    return res.data;
  },

  resetPassword: async (id, data) => {
    const res = await axiosClient.put(`/admin/users/${id}/reset-password`, data);
    return res.data;
  },

  // System Configuration
  getSystemConfigs: async () => {
    const res = await axiosClient.get('/admin/system-config');
    return res.data;
  },

  getSystemConfigByKey: async (key) => {
    const res = await axiosClient.get(`/admin/system-config/${key}`);
    return res.data;
  },

  updateSystemConfig: async (key, data) => {
    const res = await axiosClient.put(`/admin/system-config/${key}`, data);
    return res.data;
  },
};

export default adminApi;
