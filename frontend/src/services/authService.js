import api from './api';

const authService = {
  login: async (email, password) => {
    const response = await api.post('accounts/login/', { email, password });
    return response.data;
  },

  register: async (data) => {
    const response = await api.post('accounts/register/', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('accounts/profile/');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.patch('accounts/profile/', data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.post('accounts/change-password/', data);
    return response.data;
  },

  resetPassword: async (email) => {
    const response = await api.post('accounts/password-reset/', { email });
    return response.data;
  },
};

export default authService;
