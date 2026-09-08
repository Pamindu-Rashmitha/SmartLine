import axiosClient from './axiosClient';

export const authorizationApi = {
  getAuthorizationQueue: async (params = {}) => {
    const res = await axiosClient.get('/authorizations/queue', { params });
    return res.data;
  },

  recordDecision: async (applicationId, data) => {
    const res = await axiosClient.post(`/authorizations/${applicationId}/decision`, data);
    return res.data;
  },
};

export default authorizationApi;
