import api from './api';

const planService = {
  getAll: async (params = {}) => {
    const response = await api.get('plans/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`plans/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('plans/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`plans/${id}/`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`plans/${id}/`);
    return response.data;
  },
};

export default planService;
