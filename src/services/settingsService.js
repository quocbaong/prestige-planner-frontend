import api from '../lib/axios';

export const settingsService = {
  getEvent: () => api.get('/admin/settings/event'),
  saveEvent: (data) => api.post('/admin/settings/event', data),
  getPayment: () => api.get('/admin/settings/payment'),
  savePayment: (data) => api.post('/admin/settings/payment', data),
  getSecurity: () => api.get('/admin/settings/security'),
  saveSecurity: (data) => api.post('/admin/settings/security', data),
  getBranding: () => api.get('/admin/settings/branding'),
  saveBranding: (data) => api.post('/admin/settings/branding', data),
  getNotification: () => api.get('/admin/settings/notification'),
  saveNotification: (data) => api.post('/admin/settings/notification', data),
};
