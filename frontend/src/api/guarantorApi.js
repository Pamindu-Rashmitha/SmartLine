import axiosClient from './axiosClient';

export const guarantorApi = {
  addGuarantor: async (applicationId, data) => {
    const res = await axiosClient.post(`/applications/${applicationId}/guarantors`, data);
    return res.data;
  },

  getGuarantors: async (applicationId) => {
    const res = await axiosClient.get(`/applications/${applicationId}/guarantors`);
    return res.data;
  },

  deleteGuarantor: async (guarantorId) => {
    const res = await axiosClient.delete(`/guarantors/${guarantorId}`);
    return res.data;
  },

  verifyGuarantor: async (guarantorId, data) => {
    const res = await axiosClient.put(`/guarantors/${guarantorId}/verify`, data);
    return res.data;
  },
};

export default guarantorApi;
