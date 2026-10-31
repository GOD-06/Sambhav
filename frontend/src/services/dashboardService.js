import api from './api';

const dashboardService = {
  getStats: async () => {
    const response = await api.get('dashboard/stats/');
    return response.data;
  },

  getRevenueReport: async (params = {}) => {
    const response = await api.get('dashboard/revenue/', { params });
    return response.data;
  },

  getRecentInvoices: async () => {
    const response = await api.get('invoices/', { params: { page_size: 10, ordering: '-created_at' } });
    return response.data;
  },
};

export default dashboardService;
