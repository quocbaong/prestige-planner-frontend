import api from './api';
export const financeService = {
  getOverview: () => api.get('/organizer/finance/overview'),
  getTransactions: () => api.get('/organizer/finance/transactions'),
  createWithdrawal: (data) => api.post('/organizer/finance/withdrawals', data),
  getWithdrawals: () => api.get('/organizer/finance/withdrawals'),
};
