import api from './api';
export const templateService = {
  getTemplates: () => api.get('/organizer/templates'),
  createTemplate: (data) => api.post('/organizer/templates', data),
};
