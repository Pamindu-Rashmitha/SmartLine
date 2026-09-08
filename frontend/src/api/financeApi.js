import axiosClient from './axiosClient';

export const financeApi = {
  getPendingDownPayments: async () => {
    const res = await axiosClient.get('/down-payments/pending');
    return res.data;
  },

  recordDownPayment: async (applicationId, data) => {
    const res = await axiosClient.post(`/down-payments/${applicationId}`, data);
    return res.data;
  },

  getDownPayment: async (applicationId) => {
    const res = await axiosClient.get(`/down-payments/${applicationId}`);
    return res.data;
  },

  getPendingDisbursals: async () => {
    const res = await axiosClient.get('/disbursals/pending');
    return res.data;
  },

  recordDisbursal: async (applicationId, data) => {
    const res = await axiosClient.post(`/disbursals/${applicationId}`, data);
    return res.data;
  },

  getFacilities: async (status) => {
    const params = status ? { status } : {};
    const res = await axiosClient.get('/facilities', { params });
    return res.data;
  },

  getFacilityById: async (id) => {
    const res = await axiosClient.get(`/facilities/${id}`);
    return res.data;
  },
};

export default financeApi;
