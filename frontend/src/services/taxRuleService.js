import api from './api';

const taxRuleService = {
  getAll: async (params = {}) => {
    const response = await api.get('tax-rules/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`tax-rules/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('tax-rules/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`tax-rules/${id}/`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`tax-rules/${id}/`);
    return response.data;
  },
};

export default taxRuleService;
