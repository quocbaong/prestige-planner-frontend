import api from '../lib/axios';
export const templateService = {
  getTemplates: () => api.get('/organizer/templates'),
  createTemplate: (data) => api.post('/organizer/templates', data),
};
