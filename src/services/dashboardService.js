import api from './api';
export const dashboardService = {
  getOverview: () => api.get('/organizer/dashboard/overview'),
  getRevenue: (groupBy = 'month') => api.get(`/organizer/dashboard/revenue?groupBy=${groupBy}`),
  getAttendees: () => api.get('/organizer/dashboard/attendees'),
  getCheckinDensity: (params) => api.get(`/organizer/dashboard/checkin-density?${params}`),
  getAudienceSegments: (params) => api.get(`/organizer/dashboard/audience-segments?${params}`),
  getConversionFunnel: (params) => api.get(`/organizer/dashboard/conversion-funnel?${params}`),
  getEvents: (params) => api.get(`/organizer/dashboard/events?${params}`),
  getKpiSummary: (params) => api.get(`/organizer/dashboard/overview?${params}`),
};

