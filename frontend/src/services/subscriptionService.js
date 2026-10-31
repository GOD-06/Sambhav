import api from './api';

const subscriptionService = {
  getAll: async (params = {}) => {
    const response = await api.get('subscriptions/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`subscriptions/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('subscriptions/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`subscriptions/${id}/`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`subscriptions/${id}/`);
    return response.data;
  },

  activate: async (id) => {
    const response = await api.post(`subscriptions/${id}/activate/`);
    return response.data;
  },

  pause: async (id) => {
    const response = await api.post(`subscriptions/${id}/pause/`);
    return response.data;
  },

  resume: async (id) => {
    const response = await api.post(`subscriptions/${id}/resume/`);
    return response.data;
  },

  close: async (id) => {
    const response = await api.post(`subscriptions/${id}/close/`);
    return response.data;
  },

  renew: async (id) => {
    const response = await api.post(`subscriptions/${id}/renew/`);
    return response.data;
  },
};

export default subscriptionService;
