import api from '../lib/axios';

export const adminEventService = {
  list: (params) => api.get('/admin/events', { params }),
  approve: (id) => api.post(`/admin/events/${id}/approve`),
  suspend: (id) => api.post(`/admin/events/${id}/suspend`),
  bulkApprove: (ids) => api.post('/admin/events/bulk-approve', ids),
  bulkSuspend: (ids) => api.post('/admin/events/bulk-suspend', ids),
};
