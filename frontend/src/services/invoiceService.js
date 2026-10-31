import api from './api';

const invoiceService = {
  getAll: async (params = {}) => {
    const response = await api.get('invoices/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`invoices/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('invoices/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`invoices/${id}/`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`invoices/${id}/`);
    return response.data;
  },

  confirm: async (id) => {
    const response = await api.post(`invoices/${id}/confirm/`);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.post(`invoices/${id}/cancel/`);
    return response.data;
  },

  send: async (id) => {
    const response = await api.post(`invoices/${id}/send/`);
    return response.data;
  },

  generateInvoices: async (data = {}) => {
    const response = await api.post('invoices/generate/', data);
    return response.data;
  },

  recordPayment: async (id, data) => {
    const response = await api.post(`invoices/${id}/record-payment/`, data);
    return response.data;
  },
};

export default invoiceService;
