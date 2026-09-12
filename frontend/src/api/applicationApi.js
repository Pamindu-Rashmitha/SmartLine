import axiosClient from './axiosClient';

export const applicationApi = {
  createApplication: async (payload) => {
    const res = await axiosClient.post('/applications', payload);
    return res.data;
  },

  submitApplication: async (id) => {
    const res = await axiosClient.post(`/applications/${id}/submit`);
    return res.data;
  },

  cancelApplication: async (id) => {
    const res = await axiosClient.post(`/applications/${id}/cancel`);
    return res.data;
  },

  getMyApplications: async () => {
    const res = await axiosClient.get('/applications/my');
    return res.data;
  },

  getApplicationById: async (id) => {
    const res = await axiosClient.get(`/applications/${id}`);
    return res.data;
  },

  getApplicationDetail: async (id) => {
    const res = await axiosClient.get(`/applications/${id}`);
    return res.data;
  },

  searchApplications: async (params = {}) => {
    const res = await axiosClient.get('/applications', { params });
    return res.data;
  },
};

export default applicationApi;
