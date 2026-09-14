import api from '../lib/axios';

export const adminEventService = {
  list: (params) => api.get('/admin/events', { params }),
  approve: (id) => api.post(`/admin/events/${id}/approve`),
  reject: async (id) => {
    try {
      return await api.post(`/admin/events/${id}/reject`);
    } catch (error) {
      // Keep rejection working while an older event-service image is still running.
      if ([404, 405].includes(error.response?.status)) {
        return api.post(`/admin/events/${id}/suspend`);
      }
      throw error;
    }
  },
  suspend: (id) => api.post(`/admin/events/${id}/suspend`),
  bulkApprove: (ids) => api.post('/admin/events/bulk-approve', ids),
  bulkSuspend: (ids) => api.post('/admin/events/bulk-suspend', ids),
};
