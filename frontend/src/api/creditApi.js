import axiosClient from './axiosClient';

export const creditApi = {
  getCreditQueue: async (params = {}) => {
    const res = await axiosClient.get('/credit-assessment/queue', { params });
    return res.data;
  },

  startAssessment: async (applicationId) => {
    const res = await axiosClient.post(`/credit-assessment/${applicationId}/start`);
    return res.data;
  },

  requestFieldInspection: async (applicationId, remarks = '') => {
    const res = await axiosClient.post(`/credit-assessment/${applicationId}/request-inspection`, { remarks });
    return res.data;
  },

  saveAssessment: async (applicationId, data) => {
    const res = await axiosClient.post(`/credit-assessment/${applicationId}`, data);
    return res.data;
  },

  recordCreditDecision: async (applicationId, data) => {
    const res = await axiosClient.post(`/credit-assessment/${applicationId}/decide`, data);
    return res.data;
  },

  getCreditAssessment: async (applicationId) => {
    const res = await axiosClient.get(`/credit-assessment/${applicationId}`);
    return res.data;
  },
};

export default creditApi;
