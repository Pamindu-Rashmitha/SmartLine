import axiosClient from './axiosClient';

export const verificationApi = {
  getVerificationQueue: async (params = {}) => {
    const res = await axiosClient.get('/verification/queue', { params });
    return res.data;
  },

  startVerification: async (applicationId) => {
    const res = await axiosClient.post(`/verification/${applicationId}/start`);
    return res.data;
  },

  verifyDocument: async (documentId, data) => {
    const res = await axiosClient.put(`/verification/documents/${documentId}`, data);
    return res.data;
  },

  completeVerification: async (applicationId, data) => {
    const res = await axiosClient.post(`/verification/${applicationId}/complete`, data);
    return res.data;
  },
};

export default verificationApi;
