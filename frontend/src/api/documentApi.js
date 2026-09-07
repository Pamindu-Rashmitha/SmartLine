import axiosClient from './axiosClient';

export const documentApi = {
  uploadDocument: async (applicationId, documentType, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', documentType);

    const res = await axiosClient.post(`/applications/${applicationId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getDocuments: async (applicationId) => {
    const res = await axiosClient.get(`/applications/${applicationId}/documents`);
    return res.data;
  },

  downloadDocument: async (documentId, filename) => {
    const res = await axiosClient.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    // Trigger browser download
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || 'document');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  deleteDocument: async (documentId) => {
    const res = await axiosClient.delete(`/documents/${documentId}`);
    return res.data;
  },
};

export default documentApi;
