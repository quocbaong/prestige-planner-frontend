import api from '../lib/axios';

export const settingsService = {
  getEvent: () => api.get('/admin/settings/event'),
  saveEvent: (data) => api.post('/admin/settings/event', data),
  getPayment: () => api.get('/admin/settings/payment'),
  savePayment: (data) => api.post('/admin/settings/payment', data),
};
