import axiosClient from './axiosClient';

export const agreementApi = {
  getLegalQueue: async () => {
    const res = await axiosClient.get('/agreements/queue');
    return res.data;
  },

  prepareAgreement: async (applicationId, data) => {
    const res = await axiosClient.post(`/agreements/${applicationId}`, data);
    return res.data;
  },

  verifyAgreement: async (applicationId) => {
    const res = await axiosClient.post(`/agreements/${applicationId}/verify`);
    return res.data;
  },

  getAgreementByApplication: async (applicationId) => {
    const res = await axiosClient.get(`/agreements/application/${applicationId}`);
    return res.data;
  },

  downloadAgreementPdf: async (agreementId) => {
    const res = await axiosClient.get(`/agreements/${agreementId}/pdf`, {
      responseType: 'blob',
    });
    return res.data;
  },
};

export default agreementApi;
