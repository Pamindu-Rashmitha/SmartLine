import axiosClient from './axiosClient';

export const repaymentApi = {
  // Installment Schedule APIs (US16, US18)
  generateSchedule: async (facilityId, data = {}) => {
    const res = await axiosClient.post(`/facilities/${facilityId}/schedule`, data);
    return res.data;
  },

  getSchedule: async (facilityId) => {
    const res = await axiosClient.get(`/facilities/${facilityId}/schedule`);
    return res.data;
  },

  getInstallments: async (facilityId) => {
    const res = await axiosClient.get(`/facilities/${facilityId}/installments`);
    return res.data;
  },

  syncOverdue: async () => {
    const res = await axiosClient.post('/installments/sync-overdue');
    return res.data;
  },

  // Payment Recording & Ledger APIs (US17, US18, US20)
  recordPayment: async (installmentId, data) => {
    const res = await axiosClient.post(`/installments/${installmentId}/payments`, data);
    return res.data;
  },

  getFacilityPayments: async (facilityId) => {
    const res = await axiosClient.get(`/facilities/${facilityId}/payments`);
    return res.data;
  },

  getInstallmentPayments: async (installmentId) => {
    const res = await axiosClient.get(`/installments/${installmentId}/payments`);
    return res.data;
  },

  cancelPayment: async (paymentId, data) => {
    const res = await axiosClient.put(`/payments/${paymentId}/cancel`, data);
    return res.data;
  },

  // Delinquency & Collection Recovery APIs (US19)
  getOverdueInstallments: async () => {
    const res = await axiosClient.get('/collections/overdue');
    return res.data;
  },

  recordFollowUp: async (installmentId, data) => {
    const res = await axiosClient.post(`/installments/${installmentId}/follow-ups`, data);
    return res.data;
  },

  getInstallmentFollowUps: async (installmentId) => {
    const res = await axiosClient.get(`/installments/${installmentId}/follow-ups`);
    return res.data;
  },

  getFacilityFollowUps: async (facilityId) => {
    const res = await axiosClient.get(`/facilities/${facilityId}/follow-ups`);
    return res.data;
  },
};

export default repaymentApi;
