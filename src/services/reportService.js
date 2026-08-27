import api from '../lib/axios';
export const reportService = {
  exportFinancial: (format = 'excel') => api.get(`/organizer/reports/financial?format=${format}`, { responseType: 'blob' }),
};
