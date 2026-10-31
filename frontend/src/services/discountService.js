import api from './api';

const discountService = {
  getAll: async (params = {}) => {
    const response = await api.get('discounts/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`discounts/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('discounts/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`discounts/${id}/`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`discounts/${id}/`);
    return response.data;
  },
};

export default discountService;
