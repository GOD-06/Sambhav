import api from './api';

const quotationService = {
  getAll: async (params = {}) => {
    const response = await api.get('quotations/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`quotations/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('quotations/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`quotations/${id}/`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`quotations/${id}/`);
    return response.data;
  },

  accept: async (id) => {
    const response = await api.post(`quotations/${id}/accept/`);
    return response.data;
  },

  send: async (id) => {
    const response = await api.post(`quotations/${id}/send/`);
    return response.data;
  },
};

export default quotationService;
