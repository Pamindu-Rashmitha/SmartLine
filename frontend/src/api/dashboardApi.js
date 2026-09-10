import axiosClient from './axiosClient';

export const dashboardApi = {
  /**
   * Get dynamic role-specific dashboard statistics, KPI cards, and operational queues.
   * @param {string} [role] Optional target role override (permitted for ADMIN users)
   * @returns {Promise<any>}
   */
  getStats: async (role = null) => {
    const params = role ? { role } : {};
    const response = await axiosClient.get('/dashboard/stats', { params });
    return response.data?.data || response.data;
  },
};

export default dashboardApi;
