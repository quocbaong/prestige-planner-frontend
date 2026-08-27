import api from '../lib/axios';
export const dashboardService = {
  getOrganizerFinance: () => api.get('/organizer/dashboard/finance'),
  getRevenue: (groupBy = 'month') => api.get('/organizer/dashboard/revenue', { params: { groupBy } }),
  getAdminFinance: () => api.get('/admin/dashboard/finance'),
  getEventMetrics: (eventId) => api.get(`/organizer/events/${eventId}/metrics`),
  getTicketMetrics: (eventId) => api.get(`/organizer/events/${eventId}/ticket-metrics`),
  getTicketReport: (eventId) => api.get(`/organizer/events/${eventId}/ticket-report`),
  getOrderMetrics: (eventId) => api.get(`/organizer/events/${eventId}/order-metrics`),
  getOrderReport: (eventId) => api.get(`/organizer/events/${eventId}/order-report`),
};

