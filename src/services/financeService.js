import api from '../lib/axios';
export const financeService = {
  getOverview: () => api.get('/organizer/finance/overview'),
  getTransactions: () => api.get('/organizer/finance/transactions'),
  createWithdrawal: (data) => api.post('/organizer/finance/withdrawals', data),
  getWithdrawals: () => api.get('/organizer/finance/withdrawals'),
  getAdminOverview: () => api.get('/admin/finance/overview'),
  getAdminTransactions: () => api.get('/admin/finance/transactions'),
  getAdminWithdrawals: () => api.get('/admin/finance/withdrawals'),
  processWithdrawal: (id, data) => api.post(`/admin/finance/withdrawals/${id}/process`, data),
  exportAdmin: () => api.get('/admin/finance/export', { responseType: 'blob' }),
};
