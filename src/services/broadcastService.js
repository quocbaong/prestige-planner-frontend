import api from '../lib/axios';

export const broadcastService = {
  getPage: () => api.get('/admin/broadcast'),
  send: (data) => api.post('/admin/broadcast', data),
};
