import api from '../lib/axios';

export const feedbackService = {
  getPage: () => api.get('/admin/feedback'),
  action: (data) => api.post('/admin/feedback/action', data),
};
