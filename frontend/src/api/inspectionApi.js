import axiosClient from './axiosClient';

export const inspectionApi = {
  getInspectionQueue: async (params = {}) => {
    const res = await axiosClient.get('/vehicle-inspections/queue', { params });
    return res.data;
  },

  recordInspection: async (applicationId, data) => {
    const res = await axiosClient.post(`/vehicle-inspections/${applicationId}`, data);
    return res.data;
  },

  getInspection: async (applicationId) => {
    const res = await axiosClient.get(`/vehicle-inspections/${applicationId}`);
    return res.data;
  },

  getAllInspections: async () => {
    const res = await axiosClient.get('/vehicle-inspections');
    return res.data;
  },
};

export default inspectionApi;
