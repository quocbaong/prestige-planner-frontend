import api from './api';
export const reportService = {
  exportReport: (format = 'excel') => api.get(`/organizer/reports/export?format=${format}`, { responseType: 'blob' }),
  exportFinancial: (format = 'excel') => api.get(`/organizer/reports/financial?format=${format}`, { responseType: 'blob' }),
};
