import api from './api';

const productService = {
  getAll: async (params = {}) => {
    const response = await api.get('products/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`products/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('products/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`products/${id}/`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`products/${id}/`);
    return response.data;
  },

  // Variants
  getVariants: async (productId) => {
    const response = await api.get(`products/${productId}/variants/`);
    return response.data;
  },

  createVariant: async (productId, data) => {
    const response = await api.post(`products/${productId}/variants/`, data);
    return response.data;
  },

  updateVariant: async (productId, variantId, data) => {
    const response = await api.patch(`products/${productId}/variants/${variantId}/`, data);
    return response.data;
  },

  deleteVariant: async (productId, variantId) => {
    const response = await api.delete(`products/${productId}/variants/${variantId}/`);
    return response.data;
  },
};

export default productService;
