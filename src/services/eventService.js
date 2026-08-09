import api from '../lib/axios';

export const eventService = {
  getEvents: () => api.get('/organizer/events'),

  getEvent: (id) => api.get(`/organizer/events/${id}`),

  createEvent: (data) => api.post('/organizer/events', data),

  updateEvent: (id, data) => api.put(`/organizer/events/${id}`, data),

  deleteEvent: (id) => api.delete(`/organizer/events/${id}`),

  publishEvent: (id, data) => api.patch(`/organizer/events/${id}/publish`, data),
  submitApproval: (id) => api.patch(`/organizer/events/${id}/submit-approval`),
  toggleSales: (id) => api.patch(`/organizer/events/${id}/toggle-sales`),

  getTimelines: (eventId) => api.get(`/organizer/events/${eventId}/timelines`),

  // Public Endpoints for Attendees
  getPublicEvents: (params) => api.get('/events', { params }),
  getPublicFeaturedEvents: () => api.get('/events/featured'),
  getPublicUpcomingEvents: () => api.get('/events/upcoming'),
  getPublicEventDetail: (slug) => api.get(`/events/${slug}`),
  getPublicEventSchedules: (id) => api.get(`/events/${id}/schedules`),
  getPublicEventTimeline: (id) => api.get(`/events/${id}/timeline`),
};
